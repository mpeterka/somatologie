import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
for (const [dataset, modelFile, expected] of [['bones', 'skeletal', 100], ['muscles', 'muscular', 15]]) {
const bones = JSON.parse(readFileSync(new URL(`${dataset}.json`, root)));
const glb = readFileSync(new URL(`models/${modelFile}.glb`, root));
assert.equal(glb.toString('ascii', 0, 4), 'glTF');
assert.equal(glb.readUInt32LE(4), 2);
assert.equal(glb.readUInt32LE(8), glb.length);
const model = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)));
const modelIds = new Set(model.nodes.map(n => n.extras?.za_name).filter(Boolean));
assert.equal(bones.length, expected);
for (const field of ['id', 'cs', 'la']) {
  assert.ok(bones.every(b => typeof b[field] === 'string' && b[field].trim()));
  const count = new Set(bones.map(b => b[field])).size;
  if (field === 'id') assert.equal(count, bones.length, 'Duplicitní ID');
  else assert.ok(count >= 4, `Nedostatek odlišných názvů: ${field}`);
}
const assigned = new Set();
for (const bone of bones) {
  assert.ok(bone.meshIds.length > 0);
  for (const id of bone.meshIds) {
    assert.ok(modelIds.has(id), `Chybí model: ${id}`);
    assert.ok(!assigned.has(id), `Duplicitní model: ${id}`);
    assigned.add(id);
  }
}
assert.ok(existsSync(new URL('models/License.txt', root)));
console.log(`OK: ${dataset}, ${bones.length} otázek, ${assigned.size} jednoznačných částí modelu.`);
}
const directions = JSON.parse(readFileSync(new URL('directions.json', root)));
assert.equal(directions.length, 21);
assert.equal(directions.filter(item => item.region === 'Roviny').length, 3);
assert.equal(new Set(directions.map(item => item.id)).size, 21);
console.log('OK: 3 roviny a 18 směrů.');
