const express = require('express');
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const asyncHandler = require('express-async-handler');

const readFile = promisify(fs.readFile);
const statFile = promisify(fs.stat);

const fileTypes = require('./types');
const hosts = require('./hosts');
const app = express();
app.set('etag', 'strong');
app.set('x-powered-by', false);

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
        return indexFile;
      }
    } else if (stat.isFile()) {
      return file;
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
        // This is the best encoding to use.
        return {
          name,
          path: encodedFilePath,
          stat: encodedFileStat
        };
      }
    } catch (e) {
      // File does not exist.
    }
  }

  // No alternative encodings possible.
  return null;
};

const logicalRedirect = (fileName) => (req, res, next) => {
  req.logicalPath = fileName;
  next();
};

const logicalRedirectWithBranch = (fileName) => (req, res, next) => {
  req.logicalPath = `/${req.params.branch}${fileName}`;
  next();
};

app.use((req, res, next) => {
  const hostname = req.hostname;
  if (!hosts.hasOwnProperty(hostname)) {
    next(new Error('Invalid hostname'));
    return;
  }
  const host = hosts[hostname];
  const branches = host.branches;

  let path = req.path;
  let prefix = '';

  if (branches) {
    const branchMatch = path.match(/^\/([\w\d_-]+)\//);
    if (branchMatch) {
      const branchName = branchMatch[1];
      prefix = `/${branchName}`;
      path = path.substring(prefix.length);
    }
  }

  if (/^\/(?:\d+\/)?$/.test(path)) {
    req.logicalPath = `${prefix}/index.html`;
  } else if (/^\/(?:\d+\/)?editor\/?$/.test(path)) {
    req.logicalPath = `${prefix}/editor.html`;
  } else if (/^\/(?:\d+\/)?fullscreen\/?$/.test(path)) {
    req.logicalPath = `${prefix}/fullscreen.html`;
  }

  req.root = host.root;

  next();
});

app.get('/*', asyncHandler(async (req, res, next) => {
  const pathName = req.logicalPath || req.path;

  if (/[^a-zA-Z0-9.\-\/]/.test(pathName)) {
    next();
    return;
  }

  const requestPathName = safeJoin(req.root, pathName);
  if (!requestPathName) {
    next();
    return;
  }

  let filePath = await findFile(requestPathName);
  if (!filePath) {
    next();
    return;
  }

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
      contentEncoding = bestEncoding.name;
    }
  }

  let contents;
  try {
    contents = await readFile(filePath);
  } catch (e) {
    // File does not exist. This is possible if a race condition occurs between when we found the file and when we read the file.
    next();
    return;
  }

  // Don't send headers until the very end
  res.setHeader('Content-Type', fileType.type);
  if (fileEncodings.length > 0) {
    res.setHeader('Vary', 'Accept-Encoding');
  }
  if (contentEncoding !== null) {
    res.setHeader('Content-Encoding', contentEncoding);
  }

  res.send(contents);
}));

app.use((req, res) => {
  res.status(404);
  res.contentType('text/plain');
  res.send('404');
});

app.use((err, req, res, next) => {
  if (app.get('env') === 'development') {
    // Do not log errors in production, as it may be possible for someone to abuse console.error's sync behaviors to DoS
    console.error(err);
  }
  res.status(500);
  res.contentType('text/plain');
  res.send('Internal server error');
});

app.listen('1234');
