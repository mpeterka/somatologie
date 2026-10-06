import { writeFileSync, readFileSync } from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const buffer = readFileSync(new URL('models/muscular.glb', root));
const model = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)));
const ids = [...new Set(model.nodes.map(node => node.extras?.za_name).filter(Boolean))];
const definitions = [
  ['trapezius', 'Trapézový sval', 'Musculus trapezius', 'Trup', /part of trapezius muscle/i],
  ['deltoideus', 'Deltový sval', 'Musculus deltoideus', 'Horní končetina', /part of deltoid muscle/i],
  ['biceps', 'Dvojhlavý sval pažní', 'Musculus biceps brachii', 'Horní končetina', /head of biceps brachii/i],
  ['triceps', 'Trojhlavý sval pažní', 'Musculus triceps brachii', 'Horní končetina', /head of triceps brachii/i],
  ['brachialis', 'Pažní sval', 'Musculus brachialis', 'Horní končetina', /^Brachialis muscle\./],
  ['pectoralis', 'Velký prsní sval', 'Musculus pectoralis major', 'Trup', /(?:part|head) of pectoralis major muscle/i],
  ['latissimus', 'Široký sval zádový', 'Musculus latissimus dorsi', 'Trup', /^Latissimus dorsi muscle\./],
  ['rectus-abdominis', 'Přímý sval břišní', 'Musculus rectus abdominis', 'Trup', /^Rectus abdominis muscle\./],
  ['sternocleidomastoideus', 'Zdvihač hlavy', 'Musculus sternocleidomastoideus', 'Krk', /^Sternocleidomastoid muscle\./],
  ['gluteus', 'Velký hýžďový sval', 'Musculus gluteus maximus', 'Dolní končetina', /^Gluteus maximus muscle\./],
  ['sartorius', 'Krejčovský sval', 'Musculus sartorius', 'Dolní končetina', /^Sartorius muscle\./],
  ['rectus-femoris', 'Přímý sval stehenní', 'Musculus rectus femoris', 'Dolní končetina', /^Rectus femoris muscle\./],
  ['gastrocnemius', 'Dvojhlavý sval lýtkový', 'Musculus gastrocnemius', 'Dolní končetina', /head of gastrocnemius\./i],
  ['soleus', 'Šikmý sval lýtkový', 'Musculus soleus', 'Dolní končetina', /^Soleus muscle\./],
  ['tibialis', 'Přední sval holenní', 'Musculus tibialis anterior', 'Dolní končetina', /^Tibialis anterior muscle\./]
];
const muscles = definitions.map(([id, cs, la, region, match]) => {
  const meshIds = ids.filter(name => match.test(name));
  if (meshIds.length < 2) throw new Error(`Incomplete muscle: ${id}`);
  return {id, cs, la, region, meshIds};
});
const directions = [
  ['sagittalis', 'Sagitální (šípová) rovina', 'Planum sagittale', 'Roviny', 'Dělí tělo na levou a pravou část.'],
  ['frontalis', 'Frontální (čelní) rovina', 'Planum frontale', 'Roviny', 'Dělí tělo na přední a zadní část.'],
  ['transversalis', 'Transverzální (příčná) rovina', 'Planum transversum', 'Roviny', 'Dělí tělo na horní a dolní část.'],
  ['cranialis', 'Kraniální — k hlavě', 'Cranialis', 'Směry', 'Směr k hlavě.'],
  ['caudalis', 'Kaudální — k dolnímu konci těla', 'Caudalis', 'Směry', 'Směr k dolnímu konci trupu.'],
  ['ventralis', 'Ventrální — dopředu', 'Ventralis', 'Směry', 'Směr k přední, břišní straně těla.'],
  ['dorsalis', 'Dorzální — dozadu', 'Dorsalis', 'Směry', 'Směr k zadní, zádové straně těla.'],
  ['medialis', 'Mediální — ke střední rovině', 'Medialis', 'Směry', 'Směr ke střední rovině těla.'],
  ['lateralis', 'Laterální — od střední roviny', 'Lateralis', 'Směry', 'Směr od střední roviny ke straně.'],
  ['proximalis', 'Proximální — k trupu', 'Proximalis', 'Směry', 'Na končetině směrem k jejímu připojení k trupu.'],
  ['distalis', 'Distální — od trupu', 'Distalis', 'Směry', 'Na končetině směrem od jejího připojení k trupu.'],
  ['superficialis', 'Povrchový — k povrchu', 'Superficialis', 'Hloubka', 'Blíže k povrchu těla.'],
  ['profundus', 'Hluboký — do hloubky', 'Profundus', 'Hloubka', 'Dále od povrchu, do hloubky těla.'],
  ['radialis', 'Radiální — k palcové straně', 'Radialis', 'Končetiny', 'Na předloktí směrem k vřetenní kosti, na palcovou stranu.'],
  ['ulnaris', 'Ulnární — k malíkové straně', 'Ulnaris', 'Končetiny', 'Na předloktí směrem k loketní kosti, na malíkovou stranu.'],
  ['tibialis', 'Tibiální — k holenní kosti', 'Tibialis', 'Končetiny', 'Na bérci směrem k holenní kosti, na vnitřní stranu.'],
  ['fibularis', 'Fibulární — k lýtkové kosti', 'Fibularis', 'Končetiny', 'Na bérci směrem k lýtkové kosti, na zevní stranu.'],
  ['palmaris', 'Dlaňový', 'Palmaris', 'Končetiny', 'Směr k dlani, dlaňová strana ruky.'],
  ['plantaris', 'Chodidlový', 'Plantaris', 'Končetiny', 'Směr k plosce, chodidlová strana nohy.'],
  ['dexter', 'Pravý', 'Dexter', 'Směry', 'Pravá strana z pohledu člověka na obrázku.'],
  ['sinister', 'Levý', 'Sinister', 'Směry', 'Levá strana z pohledu člověka na obrázku.']
].map(([id, cs, la, region, explanation]) => ({id, cs, la, region, explanation}));
for (const [name, data] of [['muscles', muscles], ['directions', directions]]) {
  writeFileSync(new URL(`${name}.json`, root), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${name}: ${data.length}`);
}
