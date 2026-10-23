"""Keep reviewed learning modules in the self-contained HTML delivery."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
page = root / 'index.html'
html = page.read_text()
start = '/* BEGIN LEARNING REVISION 20261023 */'
end = '/* END LEARNING REVISION 20261023 */'
if start in html:
    a = html.index(start)
    b = html.index(end, a) + len(end)
    html = html[:a] + html[b:]
modules = '\n\n'.join((root / name).read_text() for name in ['learning-language-fragment.js', 'learning-writing-fragment.js'])
assert html.count('\nboot();') == 1
html = html.replace('\nboot();', '\n' + start + '\n' + modules + '\n' + end + '\nboot();')
page.write_text(html)
