const express = require('express');
const path = require('path');
const fs = require('fs');
const url = require('url');
const promisify = require('util').promisify;
const etag = require('etag');
const fresh = require('fresh');
const asyncHandler = require('express-async-handler');
const statFile = promisify(fs.stat);

const fileTypes = require('./types');
const hosts = require('./hosts');
const stats = require('./stats');
const logger = require('./logger');
const environment = require('./environment');

// We need to make sure that all the roots have a trailing / to ensure that the path traversal prevention works properly.
// Otherwise a root of "/var/www" would allow someone to read files in /var/www-top-secret-do-not-read
for (const hostname of Object.keys(hosts)) {
  const host = hosts[hostname];
  host.root = path.join(host.root, '/');
  host.staging = !!host.staging;
}
// Set optional properties
for (const fileTypeName of Object.keys(fileTypes)) {
  const fileType = fileTypes[fileTypeName];
  if (!fileType.encodings) fileType.encodings = [];
}

if (!environment.isTest) {
  logger.info(`Known hosts: ${Object.keys(hosts).join(', ')}`)
  logger.info(`Known file types: ${Object.keys(fileTypes).join(', ')}`)
}

const app = express();
app.set('x-powered-by', false);
// we handle ETag ourselves
app.set('etag', false);
app.set('case sensitive routing', false);
app.set('strict routing', false);
app.set('trust proxy', true);

const safeJoin = (root, file) => {
  const newPath = path.join(root, file);
  // We need to make sure to check for path traversal exploits.
  if (newPath.indexOf(root) !== 0) {
    return null;
  }
  return newPath;
};

const findFile = async (file) => {
  try {
    const stat = await statFile(file);
    if (stat.isDirectory()) {
      const indexFile = path.join(file, 'index.html');
      const indexStat = await statFile(indexFile);
      if (indexStat.isFile()) {
        return {
          path: indexFile,
          isDirectory: true,
          stat: indexStat
        };
      }
    } else if (stat.isFile()) {
      return {
        path: file,
        isDirectory: false,
        stat
      };
    }
  } catch (e) {
    // File does not exist.
  }
  return null;
};

const getFileType = (file) => {
  const extensionName = path.extname(file);
  if (!fileTypes.hasOwnProperty(extensionName)) {
    return null;
  }
  return fileTypes[extensionName];
};

const chooseEncoding = async (acceptedEncodings, fileEncodings, filePath) => {
  // Encodings are checked in the order they are specified.
  for (const encoding of fileEncodings) {
    const name = encoding.name;
    if (acceptedEncodings.indexOf(name) === -1) {
      // This encoding is not supported.
      continue;
    }

    const encodedFilePath = `${filePath}.${encoding.extension}`;
    try {
      const encodedFileStat = await statFile(encodedFilePath);
      if (encodedFileStat.isFile()) {
        return {
          name,
          path: encodedFilePath,
          stat: encodedFileStat
        };
      }
    } catch (e) {
      // The file for this encoding does not exist, keep checking others.
    }
  }

  // No alternative encodings supported.
  return null;
};

const handleWildcardRedirects = (branchRelativePath) => {
  if (/^\/(?:\d+\/?)?$/.test(branchRelativePath)) {
    return '/index.html';
  } else if (/^\/(?:\d+\/)?editor\/?$/i.test(branchRelativePath)) {
    return '/editor.html';
  } else if (/^\/(?:\d+\/)?fullscreen\/?$/i.test(branchRelativePath)) {
    return '/fullscreen.html';
  } else if (/^\/(?:\d+\/)?embed\/?$/i.test(branchRelativePath)) {
    return '/embed.html';
  } else if (/^\/addons\/?$/i.test(branchRelativePath)) {
    return '/addons.html';
  }
  return null;
};

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  const hostname = req.hostname;
  if (!hosts.hasOwnProperty(hostname)) {
    res.status(400);
    res.contentType('text/plain');
    res.send('Invalid Host');
    return;
  }

  const host = hosts[hostname];
  const branches = host.branches;
  const path = req.path;

  if (host.staging) {
    res.header('Origin-Agent-Cluster', '?1');
    res.header('X-Robots-Tag', 'noindex');
  }

  if (branches) {
    const branchMatch = path.match(/^\/([\w\d_-]+)\/?/);
    if (branchMatch) {
      const branchName = branchMatch[1];
      const prefix = `/${branchName}`;
      const branchRelativePath = path.substring(prefix.length);

      if (branchName === 'interpolated-60' || branchName === 'interpolation') {
        const oldSearch = url.parse(req.url).search;
        const newSearch = oldSearch ? oldSearch + '&interpolate' : '?interpolate';
        res.redirect(`https://turbowarp.org${branchRelativePath}${newSearch}`);
        return;
      }

      if (branchName === 'sounds-no-yield') {
        const search = url.parse(req.url).search;
        res.redirect(`https://experiments.turbowarp.org/no-limits${branchRelativePath}${search || ''}`);
        return;
      }

      const redirectPath = handleWildcardRedirects(branchRelativePath);
      if (redirectPath !== null) {
        req.logicalPath = `${prefix}${redirectPath}`;
      }
    }
  } else {
    const redirectPath = handleWildcardRedirects(path);
    if (redirectPath !== null) {
      req.logicalPath = redirectPath;
    }
  }

  req.root = host.root;

  stats.handleRequest(req);

  next();
});

app.get('/desktop', (req, res) => res.redirect('https://desktop.turbowarp.org/'));
app.get('/download', (req, res) => res.redirect('https://desktop.turbowarp.org/'));
app.get('/packager', (req, res) => res.redirect('https://packager.turbowarp.org/'));

app.get('*/js/*', (req, res, next) => {
  // File names contain hash of content, can cache forever.
  res.header('Cache-Control', 'public, max-age=315360000, immutable');
  next();
});
app.get('*/static/assets/*', (req, res, next) => {
  // File names contain hash of content, can cache forever.
  res.header('Cache-Control', 'public, max-age=315360000, immutable');
  next();
});
app.get('*/static/blocks-media/*', (req, res, next) => {
  // File names don't contain hash of content, but these files are hot and will rarely change.
  res.header('Cache-Control', 'public, max-age=3600, immutable');
  next();
});
app.get('*', (req, res, next) => {
  // Ask browsers to revalidate all files that aren't explicitly cached
  if (res.getHeader('Cache-Control') === undefined) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.get('/*', asyncHandler(async (req, res, next) => {
  const pathName = req.logicalPath || req.path;

  if (/[^a-zA-Z0-9.\-_\/~]/.test(pathName)) {
    next();
    return;
  }

  const requestPathName = safeJoin(req.root, pathName);
  if (!requestPathName) {
    next();
    return;
  }

  const foundFile = await findFile(requestPathName);
  if (!foundFile) {
    next();
    return;
  }
  if (foundFile.isDirectory && !req.path.endsWith('/')) {
    // If opening a directory, make sure there is a trailing / (fixes relative paths)
    res.redirect(req.path + '/');
    return;
  }

  let filePath = foundFile.path;
  let fileStat = foundFile.stat;

  const fileType = getFileType(filePath);
  if (fileType === null) {
    next();
    return;
  }

  let contentEncoding = null;
  const fileEncodings = fileType.encodings;
  if (fileEncodings.length > 0) {
    const acceptedEncodings = req.acceptsEncodings();
    const bestEncoding = await chooseEncoding(acceptedEncodings, fileEncodings, filePath);
    if (bestEncoding !== null) {
      filePath = bestEncoding.path;
      fileStat = bestEncoding.stat;
      contentEncoding = bestEncoding.name;
    }
  }
  const varyAcceptEncoding = fileEncodings.length > 0;

  const etagValue = etag(fileStat, {
    weak: true
  });
  if (filePath.includes('staging') || environment.isTest) {
    if (fresh(req.headers, {etag: etagValue})) {
      res.status(304);
      res.setHeader('ETag', etagValue);
      if (varyAcceptEncoding) {
        res.setHeader('Vary', 'Accept-Encoding');
      }
      stats.handleServedFile(pathName);
      res.end();
      return;
    }
  }

  const stream = fs.createReadStream(filePath);

  stream.on('open', () => {
    // Don't send file headers until just before we start sending the file
    // Otherwise if we sent these earlier, we might send headers that don't make sense for eg. an error message
    res.setHeader('Content-Type', fileType.type);
    res.setHeader('Content-Length', fileStat.size);
    if (contentEncoding !== null) {
      res.setHeader('Content-Encoding', contentEncoding);
    }
    res.setHeader('ETag', etagValue);
    if (varyAcceptEncoding) {
      res.setHeader('Vary', 'Accept-Encoding');
    }
    stats.handleServedFile(pathName);
    stream.pipe(res);
  });

  stream.on('error', (err) => {
    // This should never happen.
    next(err);
  });
}));

app.use((req, res) => {
  stats.handleNotFound(req.path);
  res.status(404);
  res.setHeader('Cache-Control', 'no-cache');
  res.contentType('text/plain');
  res.send('404 Not Found');
});

app.use((err, req, res, next) => {
  const message = err && err.stack || err;
  logger.error(message);
  res.setHeader('Cache-Control', 'no-store');
  res.status(500);
  res.contentType('text/plain');
  res.send('Internal server error');
});

module.exports = app;
