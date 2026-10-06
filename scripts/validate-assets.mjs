import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
const bones = JSON.parse(readFileSync(new URL('bones.json', root)));
const glb = readFileSync(new URL('models/skeletal.glb', root));
assert.equal(glb.toString('ascii', 0, 4), 'glTF');
assert.equal(glb.readUInt32LE(4), 2);
assert.equal(glb.readUInt32LE(8), glb.length);
const model = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)));
const modelIds = new Set(model.nodes.filter(n => n.mesh !== undefined).map(n => n.extras?.za_name));
assert.equal(bones.length, 100);
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
console.log(`OK: ${bones.length} kostí, ${assigned.size} jednoznačných částí modelu.`);
