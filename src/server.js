const express = require('express');
const path = require('path');
const fs = require('fs');
const url = require('url');
const promisify = require('util').promisify;
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
const userPageFile = fs.readFileSync(path.join(__dirname, 'userpage.html'));

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

      if (
        branchName === 'unsandboxed-extensions' ||
        branchName === 'return' ||
        branchName === 'merge-upstream'
      ) {
        const search = url.parse(req.url).search;
        res.redirect(`https://turbowarp.org${branchRelativePath}${search || ''}`);
        return;
      }

      req.branchPrefix = prefix;
      req.branchRelativePath = branchRelativePath;
    } else {
      req.branchPrefix = '';
      req.branchRelativePath = path;
    }
  } else {
    // People send us a bunch of weird links and expect them to work.
    // This will help them get to the right place.
    const projectMatch = (
      // /projects/123 to /123 and /https://scratch.mit.edu/projects/123 to /123
      path.match(/^\/(?:https:\/\/scratch\.mit\.edu\/)?projects\/(\d+)\/?(?:(editor|fullscreen|embed)\/?)?$/) ||
      // /123) to /123
      path.match(/^\/(\d+)\/?(?:(editor|fullscreen|embed)\/?)?\)+$/)
    );
    if (projectMatch) {
      const search = url.parse(req.url).search;
      const id = projectMatch[1];
      const pageType = projectMatch[2];
      res.redirect(`/${id}${pageType ? `/${pageType}` : ''}${search || ''}`);
      return;
    }

    req.branchPrefix = '';
    req.branchRelativePath = path;
  }

  req.root = host.root;

  stats.handleRequest(req);

  next();
});

app.get('/donate', (req, res) => res.redirect('https://muffin.ink/donate.html'));
app.get('/desktop', (req, res) => res.redirect('https://desktop.turbowarp.org/'));
app.get('/download', (req, res) => res.redirect('https://desktop.turbowarp.org/'));
app.get('/packager', (req, res) => res.redirect('https://packager.turbowarp.org/'));
app.get('/packager-legacy', (req, res) => res.redirect('https://packager-legacy.turbowarp.org/'));
app.get('/packager-extras', (req, res) => res.redirect('https://github.com/TurboWarp/packager-extras/releases'));
app.get('/docs', (req, res) => res.redirect('https://docs.turbowarp.org/'));
app.get('/extensions', (req, res) => res.redirect('https://extensions.turbowarp.org/'));
app.get('/unpackager', (req, res) => res.redirect('https://turbowarp.github.io/unpackager/'));
app.get('/trampoline', (req, res) => res.redirect('https://trampoline.turbowarp.org/'));
app.get('/clouddata', (req, res) => res.redirect('https://clouddata.turbowarp.org/'));
app.get('/share', (req, res) => res.redirect('https://share.turbowarp.org/'));
app.get('/sb3fix', (req, res) => res.redirect('https://turbowarp.github.io/sb3fix/'));
app.get('/types', (req, res) => res.redirect('https://turbowarp.github.io/types/'));
app.get('/types-tw', (req, res) => res.redirect('https://turbowarp.github.io/types-tw/'));
app.get('/scratch-vm', (req, res) => res.redirect('https://turbowarp.github.io/scratch-vm/'));
app.get('/scratch-blocks', (req, res) => res.redirect('https://turbowarp.github.io/scratch-blocks/tests/vertical_playground_compressed.html'));
app.get('/sb-downloader', (req, res) => res.redirect('https://forkphorus.github.io/sb-downloader/'));
app.get('/discover-addons', (req, res) => res.redirect('/editor'));

app.get('/users/:user', (req, res) => {
  res.contentType('text/html');
  res.status(404);
  res.send(userPageFile);
});

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
  res.header('Cache-Control', 'public, max-age=604800, immutable');
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
  let projectUnshared = false;

  {
    const branchRelativePath = req.branchRelativePath;
    const branchPrefix = req.branchPrefix;
    let match;
    if (match = branchRelativePath.match(/^\/(\d+)?\/?$/)) {
      pathName = `${branchPrefix}/index.html`;
      projectId = match[1];
    } else if (match = branchRelativePath.match(/^\/(?:(\d+)\/)?editor\/?$/i)) {
      pathName = `${branchPrefix}/editor.html`;
      projectId = match[1];
    } else if (match = branchRelativePath.match(/^\/(?:(\d+)\/)?fullscreen\/?$/i)) {
      pathName = `${branchPrefix}/fullscreen.html`;
      projectId = match[1];
    } else if (match = branchRelativePath.match(/^\/(?:(\d+)\/)?embed\/?$/i)) {
      pathName = `${branchPrefix}/embed.html`;
      projectId = match[1];
    } else if (/^\/addons\/?$/i.test(branchRelativePath)) {
      pathName = `${branchPrefix}/addons.html`;
    }
  }

  if (projectId && isSpider(req.get('User-Agent'))) {
    try {
      projectMeta = await ScratchAPI.getProjectMeta(projectId);
    } catch (e) {
      if (e.message.includes('unshared')) {
        projectUnshared = true;
      } else {
        logger.error(e);
      }
    }
  }
  const requiresSpecialRewriting = projectMeta || projectUnshared;

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
  if (fileEncodings.length > 0 && !requiresSpecialRewriting) {
    const acceptedEncodings = req.acceptsEncodings();
    const bestEncoding = await chooseEncoding(acceptedEncodings, fileEncodings, filePath);
    if (bestEncoding !== null) {
      filePath = bestEncoding.path;
      fileStat = bestEncoding.stat;
      contentEncoding = bestEncoding.name;
    }
  }
  const varyAcceptEncoding = fileEncodings.length > 0;

  const sendFileHeaders = () => {
    stats.handleServedFile(pathName);
    res.setHeader('Content-Type', fileType.type);
    if (contentEncoding !== null) {
      res.setHeader('Content-Encoding', contentEncoding);
    }
    if (varyAcceptEncoding) {
      res.setHeader('Vary', 'Accept-Encoding');
    }
  };

  if (requiresSpecialRewriting) {
    let fileContents = await readFile(filePath, 'utf-8');

    let newHead;
    if (projectMeta) {
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
      const author = projectMeta.author.username;
      newHead =
        '<meta name="theme-color" content="#ff4c4c">' +
        '<meta property="og:type" content="website">' +
        `<meta property="og:title" content="${escapeHTML(projectMeta.title)}">` +
        `<title>${escapeHTML(projectMeta.title)}</title>` +
        `<meta property="og:image" content="${escapeHTML(`https://trampoline.turbowarp.org/thumbnails/${projectId}`)}">` +
        `<meta property="og:author" content="${escapeHTML(author)}">` +
        `<meta name="author" content="${escapeHTML(author)}">` +
        `<meta property="og:url" content="${escapeHTML(`https://turbowarp.org/${projectId}`)}">` +
        `<meta property="og:description" content="${escapeHTML(description)}">` +
        `<meta name="description" content="${escapeHTML(description)}">` +
        '<meta property="og:site_name" content="TurboWarp">' +
        '<meta property="og:image:width" content="480">' +
        '<meta property="og:image:height" content="360">' +
        '<meta name="twitter:card" content="summary_large_image">';
      fileContents = fileContents.replace(/<meta name="description" content="TurboWarp is a Scratch mod with a compiler to run projects faster, dark mode for your eyes, a bunch of addons to improve the editor, and more." ?\/>/, '');
      fileContents = fileContents.replace(/<title>TurboWarp - Run Scratch projects faster<\/title>/, '');
    } else if (projectUnshared) {
      newHead = '<meta name="robots" content="noindex">';
    }
    if (newHead) {
      fileContents = fileContents.replace('</head>', newHead + '</head>');
    }

    sendFileHeaders();
    res.send(fileContents);
  } else {
    const stream = fs.createReadStream(filePath);

    // If the stream is taking a completely unreasonable amount of time, assume that something timed
    // out and the connection ought to be killed.
    const timeoutId = setTimeout(() => {
      // Will trigger stream error handler.
      stream.destroy(new Error('Timed out'));
    }, 1000 * 60 * 60);

    const onResponseClose = () => {
      logger.warn('Response closed');
    };
    res.on('close', onResponseClose);

    stream.on('open', () => {
      sendFileHeaders();
      res.setHeader('Content-Length', fileStat.size);
      stream.pipe(res);
    });
    stream.on('end', () => {
      clearTimeout(timeoutId);
      res.off('close', onResponseClose);
    });
    stream.on('error', (err) => {
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
  if (res.headersSent) {
    // Too late to try sending a proper error page.
    logger.warn('Headers already sent. Unable to send proper error page.');
    res.end();
  } else {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500);
    res.contentType('text/plain');

    let errorPage = '500 Internal server error';
    if (environment.isDevelopment) {
      errorPage += `\n\n${message}`;
    }
    res.send(errorPage);
  }
});

module.exports = app;
