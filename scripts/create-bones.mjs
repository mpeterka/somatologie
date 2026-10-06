import { writeFileSync } from 'node:fs';
const bones = [];
const add = (id, cs, la, region, meshIds = [id]) => bones.push({ id, cs, la, region, meshIds });
const pair = (mesh, cs, la, gender, region) => {
  for (const [side, cz, suffix] of [['l', 'levá', 'sinister'], ['r', 'pravá', 'dexter']]) {
    const latin = gender === 'n' ? (side === 'l' ? 'sinistrum' : 'dextrum') : gender === 'f' ? (side === 'l' ? 'sinistra' : 'dextra') : suffix;
    add(`${mesh}.${side}`, `${cs} (${cz})`, `${la} ${latin}`, region);
  }
};
for (const [mesh, cs, la] of [
  ['Frontal bone', 'Kost čelní', 'Os frontale'],
  ['Occipital bone', 'Kost týlní', 'Os occipitale'],
  ['Sphenoid bone', 'Kost klínová', 'Os sphenoidale'],
  ['Ethmoid bone', 'Kost čichová', 'Os ethmoidale'],
  ['Vomer', 'Kost radličná', 'Vomer'],
  ['Mandible', 'Dolní čelist', 'Mandibula'],
  ['Hyoid bone', 'Jazylka', 'Os hyoideum']
]) add(mesh, cs, la, 'Hlava');
for (const [mesh, cs, la, gender] of [
  ['Parietal bone', 'Kost temenní', 'Os parietale', 'n'],
  ['Temporal bone', 'Kost spánková', 'Os temporale', 'n'],
  ['Maxilla', 'Horní čelist', 'Maxilla', 'f'],
  ['Zygomatic bone', 'Kost lícní', 'Os zygomaticum', 'n'],
  ['Nasal bone', 'Kost nosní', 'Os nasale', 'n'],
  ['Palatine bone', 'Kost patrová', 'Os palatinum', 'n']
]) pair(mesh, cs, la, gender, 'Hlava');
add('Atlas (C1)', 'Nosič (C1)', 'Atlas', 'Páteř');
add('Axis (C2)', 'Čepovec (C2)', 'Axis', 'Páteř');
for (const [prefix, count, cs, la, first] of [
  ['C', 7, 'Krční obratel', 'Vertebra cervicalis', 3],
  ['T', 12, 'Hrudní obratel', 'Vertebra thoracica', 1],
  ['L', 5, 'Bederní obratel', 'Vertebra lumbalis', 1]
]) for (let i = first; i <= count; i++) add(`Vertebra ${prefix}${i}`, `${cs} ${prefix === 'T' ? 'Th' : prefix}${i}`, `${la} ${i}`, 'Páteř');
add('Sacrum', 'Kost křížová', 'Os sacrum', 'Páteř');
add('Coccyx', 'Kostrč', 'Os coccygis', 'Páteř');
const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'];
ordinals.forEach((ordinal, i) => pair(`${ordinal} rib`, `${i + 1}. žebro`, `Costa ${i + 1}`, 'f', 'Hrudník'));
add('Sternum', 'Kost hrudní', 'Sternum', 'Hrudník', ['Manubrium of sternum', 'Body of sternum', 'Xiphoid process']);
for (const [mesh, cs, la, gender, region] of [
  ['Clavicle', 'Kost klíční', 'Clavicula', 'f', 'Horní končetina'],
  ['Scapula', 'Lopatka', 'Scapula', 'f', 'Horní končetina'],
  ['Humerus', 'Kost pažní', 'Humerus', 'm', 'Horní končetina'],
  ['Radius', 'Kost vřetenní', 'Radius', 'm', 'Horní končetina'],
  ['Ulna', 'Kost loketní', 'Ulna', 'f', 'Horní končetina'],
  ['Scaphoid bone', 'Kost loďkovitá (zápěstí)', 'Os scaphoideum', 'n', 'Horní končetina'],
  ['Capitate bone', 'Kost hlavatá', 'Os capitatum', 'n', 'Horní končetina'],
  ['Hip bone', 'Kost pánevní', 'Os coxae', 'n', 'Dolní končetina'],
  ['Femur', 'Kost stehenní', 'Femur', 'n', 'Dolní končetina'],
  ['Patella', 'Čéška', 'Patella', 'f', 'Dolní končetina'],
  ['Tibia', 'Kost holenní', 'Tibia', 'f', 'Dolní končetina'],
  ['Fibula', 'Kost lýtková', 'Fibula', 'f', 'Dolní končetina'],
  ['Talus', 'Kost hlezenní', 'Talus', 'm', 'Dolní končetina'],
  ['Calcaneus', 'Kost patní', 'Calcaneus', 'm', 'Dolní končetina'],
  ['Navicular bone', 'Kost člunková (zánártí)', 'Os naviculare', 'n', 'Dolní končetina']
]) pair(mesh, cs, la, gender, region);
// Beginner vocabulary: identify the kind of bone, without side or numbering.
for (const bone of bones) {
  if (/^Vertebra |^Atlas \(C1\)$|^Axis \(C2\)$/.test(bone.id)) {
    bone.cs = 'Obratel'; bone.la = 'Vertebra';
  } else if (/rib\.[lr]$/.test(bone.id)) {
    bone.cs = 'Žebro'; bone.la = 'Costa';
  } else {
    bone.cs = bone.cs.replace(/ \((levá|pravá)\)$/, '');
    bone.la = bone.la.replace(/ (sinister|dexter|sinistra|dextra|sinistrum|dextrum)$/, '');
  }
}
writeFileSync(new URL('../dist/bones.json', import.meta.url), JSON.stringify(bones, null, 2) + '\n');
console.log(`Vytvořeno ${bones.length} kostí.`);
