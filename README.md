Backend logic for turbowarp.org

It's really just a complicated static file server with some extra features:

 - /1234 loads index.html, /1234/editor loads editor.html, etc.
 - Cache-Control handling
 - Negotiates pre-compressed encodings (brotli, gzip)
 - Parses Host to have multiple roots on the same server
 - Probably no major security exploits
