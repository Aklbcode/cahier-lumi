"""Ajoute à la banque Charline les phrases listées dans audit-voix/phrases-ecole.json.

Même voix (fr-BE-CharlineNeural), même débit et même découpage contrôlé que
scripts/build_natural_voices.py. Les sons de référence (ph|, sy|) ne sont pas
touchés. Exécuté par .github/workflows/voix-charline.yml, car la génération
demande l'accès au service vocal en ligne ; seuls les textes publics de
l'application sont envoyés, jamais une donnée d'enfant.
"""
import asyncio, json, re, unicodedata
import build_natural_voices as voice

ROOT = voice.ROOT
BANK = ROOT / 'voix/index-belge.json'
LIST = ROOT / 'audit-voix/phrases-ecole.json'
REPORT = ROOT / 'audit-voix/ajouts-ecole.json'


def key_norm(t):
    t = unicodedata.normalize('NFC', str(t)).replace('’', "'").replace('‘', "'")
    t = re.sub(r'\s+', ' ', t).strip()
    return re.sub(r'[.!?…:]+$', '', t).strip().casefold()


async def main():
    voice.CACHE.mkdir(parents=True, exist_ok=True)
    bank = json.loads(BANK.read_text())
    known = {key_norm(k.split('|', 1)[1]) for k in bank['clips'] if k[:2] in ('n|', 'm|', 's|')}
    wanted = json.loads(LIST.read_text())
    unique = {}
    for t in wanted:
        if key_norm(t) not in known:
            unique.setdefault(key_norm(t), t)
    pending = [t for t in unique.values() if not voice.path_for(t).exists()]
    sem = asyncio.Semaphore(3)
    done = 0

    async def batch(texts):
        nonlocal done
        await voice.generate(texts, sem)
        done += len(texts)
        print(json.dumps({'generated': done, 'total': len(pending)}), flush=True)

    await asyncio.gather(*(batch(pending[i:i + 20]) for i in range(0, len(pending), 20)))
    packno = len(bank['packs']); offset = 0; data = bytearray(); added = []; total = 0

    def flush():
        nonlocal packno, offset, data, total
        if not data:
            return
        name = f'belge-ecole-{packno}.mp3'
        (ROOT / 'voix' / name).write_bytes(data)
        bank['packs'].append(name)
        bank['scopes'].setdefault('ecole', []).append(packno)
        total += len(data); packno += 1; offset = 0; data = bytearray()

    for text in unique.values():
        clip = voice.path_for(text).read_bytes()
        if data and len(data) + len(clip) > 1_500_000:
            flush()
        bank['clips']['n|' + text] = [packno, offset, len(clip)]
        offset += len(clip); data.extend(clip); added.append(text)
    flush()
    BANK.write_text(json.dumps(bank, ensure_ascii=False, separators=(',', ':')))
    previous = json.loads(REPORT.read_text()) if REPORT.exists() else {'added': 0, 'bytes': 0, 'phrases': []}
    REPORT.write_text(json.dumps({'voice': voice.VOICE, 'rate': voice.RATE, 'added': previous['added'] + len(added),
                                  'bytes': previous['bytes'] + total, 'phrases': previous['phrases'] + added},
                                 ensure_ascii=False, indent=1) + '\n')
    LIST.write_text('[]\n')
    print(json.dumps({'complete': True, 'added': len(added), 'bytes': total}, ensure_ascii=False), flush=True)


asyncio.run(main())
