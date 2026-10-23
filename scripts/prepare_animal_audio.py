"""Prepare the attributed, locally hosted real animal recordings used by Lumi.

Only publicly licensed files listed below are fetched. Original recordings remain
in the local audio-build cache; the app ships short, gently normalised MP3 clips.
"""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import subprocess
import time
import urllib.error
import urllib.request

import imageio_ffmpeg
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets' / 'animaux'
CACHE = ROOT / '.audio-build' / 'animaux'
SOURCES = [
    ('🐮', 'vache', 'Mudchute cow 1.ogg', '4/48', 'Secretlondon', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/', 0, 2.20),
    ('🐑', 'mouton', 'Sheep bleating.ogg', '1/13', 'earthcalling', 'Domaine public', 'https://commons.wikimedia.org/wiki/File:Sheep_bleating.ogg#Licensing', 1.0, 3.6),
    ('🐶', 'chien', 'Barking of a dog.ogg', 'a/a2', 'Amada44', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/', 0, 2.62),
    ('🐱', 'chat', 'Meow.ogg', '6/62', 'Dan Crosby (Dcrosby)', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/', 0, 1.20),
    ('🦆', 'canard', 'Ducks snatching.ogg', 'f/f1', 'Bert76', 'CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 0, 3.72),
    ('🐓', 'coq', 'Rooster crowing.ogg', 'c/c5', "Filo gèn'", 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 0, 3.84),
    ('🐝', 'abeille', 'Buzzing bees.ogg', '7/77', 'Serg Childed', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 1.0, 3.60),
]


def prepare(spec):
    emoji, name, title, folder, author, license_name, license_url, start, duration = spec
    url = 'https://upload.wikimedia.org/wikipedia/commons/' + folder + '/' + title.replace(' ', '_')
    original = CACHE / title.replace(' ', '_')
    if not original.exists():
        request = urllib.request.Request(url, headers={'User-Agent': 'CahierLumiEducationalAudio/1.0 (local asset preparation)'})
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=40) as response:
                    original.write_bytes(response.read())
                break
            except urllib.error.HTTPError as exc:
                if exc.code != 429 or attempt == 2:
                    raise
                time.sleep(min(30, max(6, int(exc.headers.get('Retry-After', 6)))))
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    raw = subprocess.check_output([ffmpeg, '-v', 'error', '-ss', str(start), '-i', str(original), '-t', str(duration), '-ac', '1', '-ar', '44100', '-f', 'f32le', '-'])
    samples = np.frombuffer(raw, dtype=np.float32).copy()
    if not samples.size or not np.isfinite(samples).all():
        raise ValueError('No valid audio samples: ' + name)
    # Preserve the animal's timbre and rhythm. No synthesis or time stretching.
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(samples ** 2)))
    gain = min(0.13 / max(rms, 1e-7), 0.68 / max(peak, 1e-7), 60.0)
    samples *= gain
    edge = min(660, samples.size // 10)
    samples[:edge] *= np.linspace(0, 1, edge)
    samples[-edge:] *= np.linspace(1, 0, edge)
    # Add a small calm lead-in and tail; the short meow gets silence rather than
    # an artificial repeated cry, keeping clips at least one second long.
    samples = np.concatenate((np.zeros(2205, np.float32), samples, np.zeros(max(4410, 44100 - samples.size - 2205), np.float32)))
    target = DEST / (name + '.mp3')
    subprocess.run([ffmpeg, '-v', 'error', '-y', '-f', 'f32le', '-ar', '44100', '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '128k', str(target)], input=samples.astype(np.float32).tobytes(), check=True)
    return {
        'emoji': emoji, 'name': name, 'file': 'assets/animaux/' + target.name,
        'title': title, 'author': author,
        'source': 'https://commons.wikimedia.org/wiki/File:' + title.replace(' ', '_'),
        'originalFile': url, 'license': license_name, 'licenseUrl': license_url,
        'changes': 'Extrait, conversion mono MP3, volume ajusté, fondus courts et silence de bord. Aucune voix synthétique.',
        'excerptStartSeconds': start, 'excerptDurationSeconds': duration,
        'durationSeconds': round(samples.size / 44100, 3),
        'originalSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'bytes': target.stat().st_size,
        'credit': f'{title} — {author} — {license_name} ; extrait et volume ajusté.'
    }


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        clips = list(pool.map(prepare, SOURCES))
    data = {'version': 1, 'preparedOn': '2026-10-23', 'description': 'Vrais enregistrements d’animaux. Les extraits adaptés conservent la licence de leur source ; ces licences concernent les clips audio, pas l’ensemble du logiciel.', 'clips': clips}
    (DEST / 'credits.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    lines = ['# Enregistrements des animaux', '', 'Vrais sons, sans imitation prononcée par une voix de synthèse. Extraits hébergés localement par Lumi.', '', 'Chaque extrait adapté conserve la licence indiquée ci-dessous. Ces licences concernent les fichiers audio et ne changent pas la licence du reste de l’application.', '']
    for clip in clips:
        lines += [f"## {clip['name'].capitalize()}", '', f"**{clip['title']}**, par **{clip['author']}**.", f"[Source]({clip['source']}) · [Licence : {clip['license']}]({clip['licenseUrl']})", '', clip['changes'], f"Fichier : `{clip['file']}` · {clip['durationSeconds']} s.", '']
    lines += ['Préparés le 23 octobre 2026. Le fichier « Single Cow Moo.ogg », à la provenance contestée, n’est pas utilisé. « Mudchute duck 2.ogg », dont la description hésite entre espèces, n’est pas utilisé non plus.', '']
    (DEST / 'credits.md').write_text('\n'.join(lines))
    bank = {clip['emoji']: {key: clip[key] for key in ['file', 'name', 'credit', 'source', 'license', 'licenseUrl']} for clip in clips}
    # Common alternate cow/chicken icons may occur in legacy activities.
    bank['🐄'] = bank['🐮']
    (ROOT / 'animal-assets-fragment.js').write_text('/* Vrais cris animaliers ; crédits détaillés dans assets/animaux/credits.md. */\nconst ANIMAL_AUDIO=' + json.dumps(bank, ensure_ascii=False, indent=1) + ';\n')
    print(json.dumps({'clips': len(clips), 'bytes': sum(c['bytes'] for c in clips), 'names': [c['name'] for c in clips]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
