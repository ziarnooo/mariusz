"""Generate printable QR files only for a confirmed HTTPS page URL."""
import argparse
from pathlib import Path
from urllib.parse import urlparse

import qrcode
import qrcode.image.svg

parser = argparse.ArgumentParser()
parser.add_argument('--url', required=True)
parser.add_argument('--output', default='qr')
args = parser.parse_args()
url = args.url.strip()
parsed = urlparse(url)
if parsed.scheme != 'https' or not parsed.netloc or parsed.fragment:
    parser.error('Use the final HTTPS website URL without a slide fragment.')
if not url.endswith('/'):
    url += '/'
folder = Path(args.output)
folder.mkdir(parents=True, exist_ok=True)
code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=16, border=4)
code.add_data(url)
code.make(fit=True)
code.make_image(fill_color='#30251f', back_color='#ffffff').save(folder / 'mariusz-60-qr.png')
code.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(folder / 'mariusz-60-qr.svg')
(folder / 'adres-strony.txt').write_text(url + '\n', encoding='utf-8')
print(f'QR points to: {url}')
print(f'Files: {folder}/mariusz-60-qr.png and {folder}/mariusz-60-qr.svg')
