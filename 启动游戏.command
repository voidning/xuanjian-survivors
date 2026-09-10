#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
python3 - <<'PY'
import http.server, webbrowser
class LocalHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store, max-age=0')
        super().end_headers()
    def log_message(self,fmt,*args):
        if args and str(args[0]).startswith('GET') and len(args)>1 and str(args[1])=='200': return
        super().log_message(fmt,*args)
try:
    server=http.server.ThreadingHTTPServer(('127.0.0.1',18743),LocalHandler)
except OSError:
    print('无法开启固定本地地址。请先关闭旧游戏的服务终端，再重新启动。不会停止其他程序。',flush=True)
    input('按回车关闭此窗口…')
    raise SystemExit(1)
url='http://127.0.0.1:18743/'
print('\n几笔长生 · 修行录版本\n'+url+'\n请继续使用同一浏览器，纪录保存在该浏览器中。\n关闭此终端停止服务。\n',flush=True)
webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
PY
