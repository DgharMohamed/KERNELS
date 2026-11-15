from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Security isolation headers required for WebAssembly & SharedArrayBuffer
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.wasm'):
            return 'application/wasm'
        if path.endswith('.pck'):
            return 'application/octet-stream'
        return super().guess_type(path)

if __name__ == '__main__':
    port = 8080
    web_dir = os.path.join(os.path.dirname(__file__), 'web_build')
    os.chdir(web_dir)
    server = HTTPServer(('127.0.0.1', port), CORSRequestHandler)
    print(f"Serving {web_dir} at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
