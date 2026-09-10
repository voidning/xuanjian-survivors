#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
python3 - <<'PY'
import http.server, webbrowser
class LocalHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()
    def log_message(self, fmt, *args):
        if args and str(args[0]).startswith('GET') and len(args)>1 and str(args[1])=='200': return
        super().log_message(fmt,*args)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),LocalHandler)
url='http://127.0.0.1:%s/' % server.server_port
print('\n几笔长生 · 玄鉴仙族\n本地游戏：'+url+'\n关闭此终端窗口或按 Control+C 停止。\n',flush=True)
webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
PY
