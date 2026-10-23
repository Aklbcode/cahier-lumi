#!/usr/bin/env python3
"""Vendor the exact Twemoji SVGs used by Lumi; no run-time network dependency."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'illustrations'
VERSION = 'v17.0.3'
BASE = f'https://raw.githubusercontent.com/jdecked/twemoji/{VERSION}'
CACHE = ROOT / '.asset-build' / ('twemoji-' + VERSION)


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Cahier-de-Lumi-asset-vendor/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def codepoint(emoji):
    # Twemoji retains VS16 in joined sequences; otherwise it strips it.
    text = emoji if '\u200d' in emoji else emoji.replace('\ufe0f', '')
    return '-'.join(f'{ord(c):x}' for c in text)


def fetch_one(emoji):
    code = codepoint(emoji)
    try:
        cached = CACHE / (code + '.svg')
        data = cached.read_bytes() if cached.exists() else get(f'{BASE}/assets/svg/{code}.svg')
        if not cached.exists():
            cached.write_bytes(data)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return code, emoji, None
        raise
    svg = data.decode('utf8')
    tree = ET.fromstring(svg)
    if tree.tag != '{http://www.w3.org/2000/svg}svg':
        raise ValueError(f'Not an SVG: {code}')
    for node in tree.iter():
        if node.tag.rsplit('}', 1)[-1] in ('script', 'foreignObject', 'image', 'iframe'):
            raise ValueError(f'Unexpected active content: {code}')
        for name, value in node.attrib.items():
            links = re.findall(r'url\(([^)]*)\)', value)
            if name.rsplit('}', 1)[-1].startswith('on') or ('href' in name and not value.startswith('#')) or any(not link.strip(' \"\'').startswith('#') for link in links):
                raise ValueError(f'Unexpected external or executable reference: {code}')
    return code, emoji, svg


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    emojis = json.loads((OUT / 'requested-emoji.json').read_text())
    bundle, manifest, missing = {}, [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        for code, emoji, svg in pool.map(fetch_one, emojis):
            if svg is None:
                missing.append({'emoji': emoji, 'code': code})
                continue
            bundle[code] = svg
            manifest.append({'emoji': emoji, 'code': code, 'sha256': hashlib.sha256(svg.encode()).hexdigest(), 'bytes': len(svg.encode())})
    banner = ('/* Twemoji ' + VERSION + ' graphics — Twitter, Inc. and other contributors.\n'
              '   CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/\n'
              '   Source: https://github.com/jdecked/twemoji/tree/' + VERSION + '/assets/svg\n'
              '   SVG drawings unchanged; packaged together for local, offline use.\n'
              '   Attribution and full license: assets/illustrations/CREDITS.md, LICENSE-GRAPHICS. */\n')
    # Escaping closing tags keeps the bundle safe to inline if a standalone HTML
    # delivery is later required. Never accept arbitrary user SVG into this map.
    payload = json.dumps(dict(sorted(bundle.items())), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    (OUT / 'twemoji-bundle.js').write_text(banner + 'globalThis.LUMI_ILLUSTRATION_SVGS=Object.freeze(' + payload + ');\n')
    (OUT / 'LICENSE-GRAPHICS').write_bytes(get(BASE + '/LICENSE-GRAPHICS'))
    (OUT / 'manifest.json').write_text(json.dumps({'source': BASE, 'version': VERSION, 'license': 'CC-BY-4.0', 'files': manifest, 'missing': missing}, ensure_ascii=False, indent=2) + '\n')
    (OUT / 'CREDITS.md').write_text(f'''# Illustrations du Cahier de Lumi

Illustrations **Twemoji {VERSION}**, par **Twitter, Inc. et les autres contributeurs**, distribuées sous [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

- Source précise : [dépôt Twemoji — {VERSION}](https://github.com/jdecked/twemoji/tree/{VERSION}/assets/svg).
- Licence complète : [LICENSE-GRAPHICS](LICENSE-GRAPHICS).
- {len(bundle)} dessins SVG d’origine inchangés, regroupés dans `twemoji-bundle.js` pour fonctionner localement et hors connexion. Seul le regroupement a été modifié.
- Le manifeste donne le code Unicode, la taille et l’empreinte de chaque dessin.
- Aucune image, police d’emoji ou ressource de ce lot n’est chargée depuis un serveur tiers pendant le jeu.

La bibliothèque de parsing Twemoji n’est pas embarquée ; le code d’affichage local de Lumi n’est pas dérivé de sa bibliothèque.
''')
    print(json.dumps({'requested': len(emojis), 'included': len(bundle), 'missing': missing, 'bundle_bytes': (OUT / 'twemoji-bundle.js').stat().st_size}, ensure_ascii=False))


if __name__ == '__main__':
    main()
