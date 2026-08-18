#!/usr/bin/env python3
"""Local preview server for development only.

Identical to `python3 -m http.server` except it sends no-store cache headers.
The stock server sends none at all, so browsers cache CSS and JS aggressively
and silently serve stale files after an edit -- which cost real debugging time
during this build (a stylesheet appeared to be missing rules that were on disk).

This is dev tooling. Nothing here ships: the site itself is still plain static
files with no build step.

Usage: python3 bin/serve.py [port]
"""
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(NoCacheHandler, directory=".")
    print(f"serving {__file__.rsplit('/', 2)[0]} on http://localhost:{port} (no-store)")
    HTTPServer(("", port), handler).serve_forever()
