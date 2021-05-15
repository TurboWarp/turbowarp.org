const express = require('express');
const path = require('path');
const fs = require('fs');
const url = require('url');
const promisify = require('util').promisify;
const etag = require('etag');
const fresh = require('fresh');
const asyncHandler = require('express-async-handler');
const statFile = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const fileTypes = require('./types');
const hosts = require('./hosts');
const stats = require('./stats');
const logger = require('./logger');
const environment = require('./environment');
const isSpider = require('./spider');
const ScratchAPI = require('./scratch-api');

const notFoundFile = fs.readFileSync(path.join(__dirname, '404.html'));

// We need to make sure that all the roots have a trailing / to ensure that the path traversal prevention works properly.
// Otherwise a root of "/var/www" would allow someone to read files in /var/www-top-secret-do-not-read
for (const hostname of Object.keys(hosts)) {
  const host = hosts[hostname];
  host.root = path.join(host.root, '/');
  host.noindex = !!host.noindex;
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

const escapeHTML = str => str.replace(/([<>'"&])/g, (_, l) => `&#${l.charCodeAt(0)};`);

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

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'interest-cohort=()');
  res.header('Origin-Agent-Cluster', '?1');

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

  if (host.noindex) {
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

      if (branchName === 'sounds-no-yield' || branchName === 'no-limits') {
        const oldSearch = url.parse(req.url).search;
        const newSearch = oldSearch ? oldSearch + '&limitless' : '?limitless';
        res.redirect(`https://turbowarp.org${branchRelativePath}${newSearch}`);
        return;
      }

      req.branchPrefix = prefix;
      req.branchRelativePath = branchRelativePath;
    } else {
      req.branchPrefix = '';
      req.branchRelativePath = path;  
    }
  } else {
    // Redirect /projects/123 to /123
    // TODO move to this to seperate app.get()
    const projectMatch = path.match(/^\/(?:https:\/\/scratch\.mit\.edu\/)?projects\/(\d+)\/?$/);
    if (projectMatch) {
      const search = url.parse(req.url).search;
      res.redirect(`/${projectMatch[1]}${search || ''}`);
      return;
    }

    req.branchPrefix = '';
    req.branchRelativePath = path;
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
  let pathName = req.path;
  let projectId = null;
  let projectMeta = null;

  {
    const branchRelativePath = req.branchRelativePath;
    const branchPrefix = req.branchPrefix;
    let match;
    if (match = branchRelativePath.match(/^\/(\d+\/?)?$/)) {
      pathName = `${branchPrefix}/index.html`;
      projectId = match[1];
    } else if (match = branchRelativePath.match(/^\/(\d+\/)?editor\/?$/i)) {
      pathName = `${branchPrefix}/editor.html`;
      projectId = match[1];
    } else if (match = branchRelativePath.match(/^\/(\d+\/)?fullscreen\/?$/i)) {
      pathName = `${branchPrefix}/fullscreen.html`;
      projectId = match[1];
    } else if (/^\/(?:\d+\/)?embed\/?$/i.test(branchRelativePath)) {
      pathName = `${branchPrefix}/embed.html`;
    } else if (/^\/addons\/?$/i.test(branchRelativePath)) {
      pathName = `${branchPrefix}/addons.html`;
    }
  }

  if (projectId && isSpider(req.get('User-Agent'))) {
    try {
      projectMeta = await ScratchAPI.getProjectMeta(projectId);
    } catch (e) {
      // ignore
    }
  }

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
  // Due to terrible file response rewriting, don't use content encoding on OG requests
  if (fileEncodings.length > 0 && !projectMeta) {
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

  const sendFileHeaders = () => {
    stats.handleServedFile(pathName);
    res.setHeader('Content-Type', fileType.type);
    res.setHeader('ETag', etagValue);
    if (contentEncoding !== null) {
      res.setHeader('Content-Encoding', contentEncoding);
    }
    if (varyAcceptEncoding) {
      res.setHeader('Vary', 'Accept-Encoding');
    }
  };

  if (projectMeta) {
    const fileContents = await readFile(filePath, 'utf-8');
    sendFileHeaders();

    let description;
    if (projectMeta.instructions && projectMeta.description) {
      description = `${projectMeta.instructions}\n${projectMeta.description}`;
    } else if (projectMeta.instructions) {
      description = projectMeta.instructions;
    } else if (projectMeta.description) {
      description = projectMeta.description;
    } else {
      description = '';
    }

    const opengraph =
      '<meta name="theme-color" content="#ff4c4c" />' +
      '<meta property="og:type" content="website" />' +
      `<meta property="og:title" content="${escapeHTML(projectMeta.title)} - TurboWarp" />` +
      `<meta property="og:image" content="${escapeHTML(projectMeta.image)}" />` +
      `<meta property="og:author" content="${escapeHTML(projectMeta.author.username)}" />` +
      `<meta property="og:url" content="${escapeHTML(`https://turbowarp.org/${projectId}`)}" />` +
      `<meta property="og:description" content="${escapeHTML(description)}" />`;
    res.send(fileContents.replace('</head>', opengraph + '</head>'));
  } else {
    const stream = fs.createReadStream(filePath);
    stream.on('open', () => {
      sendFileHeaders();
      res.setHeader('Content-Length', fileStat.size);
      stream.pipe(res);
    });
    stream.on('error', (err) => {
      // This should never happen.
      next(err);
    });
  }
}));

app.use((req, res) => {
  stats.handleNotFound(req.path);
  res.status(404);
  res.setHeader('Cache-Control', 'no-cache');
  res.contentType('text/html');
  res.send(notFoundFile);
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
