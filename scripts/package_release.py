from pathlib import Path
import hashlib, json, zipfile

root=Path(__file__).resolve().parents[1]
out=root/'livraison';out.mkdir(exist_ok=True)
bank=json.loads((root/'voix/index-belge.json').read_text())
assert bank['complete'] is True
old=json.loads((root/'voix/index.json').read_text())
assert set(old['clips']) <= set(bank['clips']), 'Attendre la banque complète.'
qa=json.loads((root/'audit-voix/controle-audio-belge.json').read_text())
assert not qa['failed'] and qa['decoded']==len(bank['clips'])
paths=['index.html','speech-engine.js','README.md','manifest.webmanifest','robots.txt','.nojekyll','icone-180.png','icone-192.png','icone-512.png','voix/index-belge.json','voix/index-claire.json','voix/index.json']+['voix/'+p for p in bank['packs']]
for folder in ['scripts','tests','audit-voix']:
 paths += [str(p.relative_to(root)) for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files={p:(root/p).read_bytes() for p in paths}
for extra in ['Voix-B-Belgique.mp3','Apercu-voix-belge.png']:
 if (out/extra).exists(): files[extra]=(out/extra).read_bytes()
files['Lisez-moi.txt']='''LE CAHIER DE LUMI — VOIX BELGE NATURELLE

Cette version utilise Charline, une voix féminine en français de Belgique choisie après comparaison de deux extraits. Les sons de lecture disposent de références dédiées, sans remplacement par une prononciation automatique. Les consignes complètes sont préférées aux fragments. Les progrès existants sont conservés lors de la mise à jour du même site.

Les fichiers de cette archive constituent un site statique complet. Pour la voix enregistrée, ouvrez le site via un hébergement HTTP(S) ou un serveur local : le navigateur peut empêcher le chargement de la banque audio si index.html est simplement ouvert comme fichier.

Les fichiers ont été préparés à l’avance avec le service vocal Microsoft, à partir des textes publics du jeu. Pendant le jeu, l’application ne contacte pas ce service. Aucune réponse d’enfant ou donnée de profil n’est envoyée au service vocal. Une voix française de l’appareil peut relayer les consignes ordinaires ; un son de lecture manquant doit être réessayé et n’est jamais inventé par une voix de secours.

Consultez audit-voix/Voix-belge-et-sons-de-lecture.md pour le détail des contrôles et leurs limites. Les tests techniques ne remplacent pas une écoute acoustique et pédagogique par un spécialiste francophone.
'''.encode()
files['EMPREINTES_SHA256.txt']=''.join(hashlib.sha256(data).hexdigest()+'  '+name+'\n' for name,data in sorted(files.items())).encode()
archive=out/'Cahier de Lumi - voix belge naturelle.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in sorted(files.items()):z.writestr(name,data)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for line in z.read('EMPREINTES_SHA256.txt').decode().splitlines():
  digest,name=line.split('  ',1);assert hashlib.sha256(z.read(name)).hexdigest()==digest
print(json.dumps({'archive':str(archive),'files':len(files),'bytes':archive.stat().st_size,'clips':len(bank['clips'])},ensure_ascii=False))
