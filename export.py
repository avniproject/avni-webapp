import urllib
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from os.path import join

import sys

ADDR = "0.0.0.0"
PORT = 8000


class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        fd = open(join(sys.argv[1], "exported-files", urllib.unquote(self.path.replace("/", "")).decode('utf8')), "w")
        fd.write(self.rfile.read(int(self.headers['Content-length'])))
        fd.close()
        self.send_response(201, "CREATED")
        self.end_headers()


httpd = HTTPServer((ADDR, PORT), RequestHandler)
httpd.serve_forever()
