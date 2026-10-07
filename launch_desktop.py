import os
import sys
import time
import socket
import subprocess
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class SPAHandler(SimpleHTTPRequestHandler):
    """
    Lightning-fast HTTP server that serves pre-built React production assets instantly.
    Redirects all non-file routes to index.html for React SPA routing without overhead.
    """
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        # Resolve path
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            # Fallback to index.html for client-side routing
            index_path = os.path.join(self.directory, "index.html")
            if os.path.exists(index_path):
                self.path = "/index.html"
        return super().do_GET()

    def log_message(self, format, *args):
        # Silence static file logs for cleaner console
        pass

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def start_backend():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend", "foicedetect_backend")
    
    venv_python = os.path.join(backend_dir, "scikit_venv", "Scripts", "python.exe")
    python_cmd = venv_python if os.path.exists(venv_python) else sys.executable

    manage_py = os.path.join(backend_dir, "manage.py")
    
    # Start Django backend with no reload for maximum speed
    proc = subprocess.Popen(
        [python_cmd, manage_py, "runserver", "127.0.0.1:8000", "--noreload"],
        cwd=backend_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return proc

def start_instant_frontend(port=3000):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(base_dir, "build")

    if not os.path.exists(build_dir):
        print("[*] Production build not found. Running one-time build...")
        subprocess.run(["npm.cmd" if sys.platform == "win32" else "npm", "run", "build"], cwd=base_dir)

    handler = lambda *args, **kwargs: SPAHandler(*args, directory=build_dir, **kwargs)
    httpd = ThreadingHTTPServer(('127.0.0.1', port), handler)
    
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def wait_for_service(port, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        if is_port_in_use(port):
            return True
        time.sleep(0.1)
    return False

def open_desktop_window(url="http://localhost:3000"):
    # Priority 1: Pywebview if installed
    try:
        import webview
        webview.create_window('VoiceDetect', url, width=1280, height=850)
        webview.start()
        return
    except ImportError:
        pass

    # Priority 2: Chrome / Edge in Standalone App Window (Native desktop feel, 0s delay)
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")
    ]

    for browser_exe in edge_paths + chrome_paths:
        if os.path.exists(browser_exe):
            subprocess.Popen([browser_exe, f"--app={url}", "--window-size=1280,850"])
            return

    webbrowser.open(url)

def main():
    print("=" * 60)
    print("   🎙️ VoiceDetect - Instant High-Speed Launcher")
    print("=" * 60)

    backend_proc = None

    try:
        # 1. Start Backend
        if not is_port_in_use(8000):
            print("[*] Starting AI Backend Engine...")
            backend_proc = start_backend()
            wait_for_service(8000, timeout=10)
        else:
            print("[✓] Backend already active.")

        # 2. Instant Frontend Server (Starts in under 0.1 seconds!)
        if not is_port_in_use(3000):
            print("[*] Serving Frontend (Instant Production Mode)...")
            start_instant_frontend(port=3000)
            wait_for_service(3000, timeout=5)
        else:
            print("[✓] Frontend already active.")

        print("[✓] Opening VoiceDetect Desktop Window...")
        open_desktop_window("http://localhost:3000")

        print("\n[READY] App is running! Press Ctrl+C in this window to exit.")
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[*] Closing VoiceDetect...")
    finally:
        if backend_proc:
            backend_proc.terminate()
        print("[✓] Done.")

if __name__ == "__main__":
    main()
