import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 5050
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

class StudioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CURRENT_DIR, **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

def main():
    os.chdir(CURRENT_DIR)
    # Enable address reuse so restarting doesn't block on port
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), StudioHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("⚡ AutoCut Studio - Local Server")
        print("=" * 60)
        print(f"[*] Running at: {url}")
        print("[*] Opening your browser...")
        print("[*] Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"[!] Could not open browser automatically: {e}")
            print(f"[!] Please open {url} manually in your browser.")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Server stopped successfully.")

if __name__ == "__main__":
    main()
