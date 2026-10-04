"""Check local assets, font encoding, and birthday-card content before deployment."""
from html.parser import HTMLParser
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'style.css').read_text(encoding='utf-8')

class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.local_assets = []
        self.scenes = 0
        self.text = []
    def handle_data(self, data):
        self.text.append(data)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'section' and 'scene' in attrs.get('class', '').split():
            self.scenes += 1
            assert attrs.get('aria-labelledby'), 'Scene without a heading reference'
        for key in ('src', 'data-src', 'href'):
            value = attrs.get(key, '')
            if value and not re.match(r'^(https?:|tel:|#|data:)', value):
                self.local_assets.append(value)

inspector = Inspect()
inspector.feed(html)
assert inspector.scenes == 8, 'Expected eight scenes'
assert len(inspector.ids) == len(set(inspector.ids)), 'Duplicate HTML IDs'
for path in inspector.local_assets + re.findall(r"url\('([^']+)'\)", css):
    assert (root / path).is_file(), f'Missing asset: {path}'
for path in (root / 'assets/fonts').glob('*.woff2'):
    assert path.read_bytes()[:4] == b'wOF2', f'Not an actual WOFF2 font: {path}'
visible_text = ' '.join(inspector.text)
assert '540' not in visible_text and '2215' not in visible_text, 'Order or price accidentally published'
assert 'rok od daty wystawienia' in html
assert 'Boryska' in html and 'Gosi' in html and 'pięciu' in html
assert 'prefers-reduced-motion' in css
assert 'noindex, nofollow' in html
web = [root / n for n in ('index.html', 'style.css', 'app.js', 'content.js')]
web += [p for p in (root / 'assets').rglob('*') if p.suffix in ('.webp', '.woff2', '.svg')]
total = sum(p.stat().st_size for p in web)
assert total < 400_000, f'Assets too large: {total}'
print(f'PASS: 8 screens, local assets, WOFF2 fonts, voucher content. All web resources: {total:,} bytes.')
