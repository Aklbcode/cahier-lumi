from pathlib import Path
import hashlib, json, zipfile

root=Path(__file__).resolve().parents[1]
out=root/'livraison';out.mkdir(exist_ok=True)
bank=json.loads((root/'voix/index-claire.json').read_text())
old=json.loads((root/'voix/index.json').read_text())
assert set(old['clips']) <= set(bank['clips']), 'Attendre la banque complète.'
qa=json.loads((root/'audit-voix/controle-audio.json').read_text())
assert not qa['failed'] and qa['decoded']==len(bank['clips'])
paths=['index.html','speech-engine.js','README.md','manifest.webmanifest','robots.txt','.nojekyll','icone-180.png','icone-192.png','icone-512.png','voix/index-claire.json','voix/index.json']+['voix/'+p for p in bank['packs']]
for folder in ['scripts','tests','audit-voix']:
 paths += [str(p.relative_to(root)) for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files={p:(root/p).read_bytes() for p in paths}
for extra in ['Extrait-voix-Lumi.mp3','Apercu-voix-Lumi.png']:
 if (out/extra).exists(): files[extra]=(out/extra).read_bytes()
files['Lisez-moi.txt']='''LE CAHIER DE LUMI — VOIX PLUS CLAIRES

Cette version remplace la banque vocale et ajoute la réécoute lente (tortue), la vitesse réglable et des tests dans l’espace parents. Les progrès existants sont conservés lors de la mise à jour du même site.

Les fichiers de cette archive constituent un site statique complet. Pour la voix enregistrée, ouvrez le site via un hébergement HTTP(S) ou un serveur local : le navigateur peut empêcher le chargement de la banque audio si index.html est simplement ouvert comme fichier.

Les voix ont été générées localement. L’application n’envoie pas les réponses des enfants à un service de synthèse vocale. Une voix française installée sur l’appareil sert de secours si une consigne n’est pas enregistrée ou si la banque ne charge pas.

Consultez audit-voix/Analyse-et-corrections.md pour le détail des contrôles et leurs limites. La validation acoustique et pédagogique des sons avec un spécialiste reste recommandée.
'''.encode()
files['EMPREINTES_SHA256.txt']=''.join(hashlib.sha256(data).hexdigest()+'  '+name+'\n' for name,data in sorted(files.items())).encode()
archive=out/'Cahier de Lumi - voix ameliorees.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in sorted(files.items()):z.writestr(name,data)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for line in z.read('EMPREINTES_SHA256.txt').decode().splitlines():
  digest,name=line.split('  ',1);assert hashlib.sha256(z.read(name)).hexdigest()==digest
print(json.dumps({'archive':str(archive),'files':len(files),'bytes':archive.stat().st_size,'clips':len(bank['clips'])},ensure_ascii=False))
