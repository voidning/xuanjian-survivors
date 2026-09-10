"""Build one offline index.html with all runtime, image, and guide content embedded."""
from pathlib import Path
import re,sys,base64,mimetypes
root=Path(__file__).resolve().parents[1]
version=re.search(r"this.result.version='([^']+)'",(root/'scripts/field-event.js').read_text()).group(1)
assert len(list((root/'docs').glob(version+'-*.md')))==1,'A unique changelog is required outside the release'
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'发行版'
dest=out/('玄鉴仙族·几笔长生-'+version);dest.mkdir(parents=True,exist_ok=True)
assert all(p.name=='index.html' for p in dest.iterdir()),'Release folder must contain only index.html'
s=(root/'index.html').read_text()
def css(m):return '<style>'+(root/m[1].split('?')[0]).read_text()+'</style>'
def js(m):
 path=m[1].split('?')[0];code=(root/path).read_text()
 if path=='scripts/game.js':code='\n'.join(x for x in code.split('\n') if not x.startswith("if(new URLSearchParams(location.search).has('test'))"))
 return '<script>'+re.sub(r'</script',r'<\\/script',code,flags=re.I)+'</script>'
s=re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>',css,s)
s=re.sub(r'<script src="([^"]+)"></script>',js,s)
def asset(m):
 path=(root/m[1]).resolve();assert path.is_relative_to(root/'assets') and path.is_file(),f'Missing image: {m[1]}'
 return 'src="data:'+(mimetypes.guess_type(path)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()+'"'
s=re.sub(r'src="(assets/[^"?]+)(?:\?[^"]*)?"',asset,s)
assert not re.search(r'<script src=|<link rel="stylesheet" href=|href="guide.html"',s),'External runtime or guide dependency remains'
(dest/'index.html').write_text(s)
print(dest/'index.html')
