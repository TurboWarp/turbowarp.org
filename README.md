Backend logic for turbowarp.org and some of its subdomains

It's really just a static file server with some extras:

 - Wildcard routing aliases: /1234 loads index.html, /1234/editor loads editor.html, etc.
 - Sets proper Cache-Control for certain routes used by TurboWarp to greatly improve performance
 - Negotiates pre-compressed encodings -- brotli reduces our 11MB JavaScript bundle to under 2MB, but brotli is very slow, so we do it at build time instead of dynamically. gzip is also supported.
 - Parses Host to have multiple roots on the same instance.
 - Redirects for old experiments
 - Probably no major security exploits.

Known file types can be configured in types.js

Hosts and their roots can be configured in hosts.js. branches controls whether this root uses branches (like https://experiments.turbowarp.org/no-limits/).

The code here is very purpose built for turbowarp.org and isn't easily extensible. I would not recommend using it.
