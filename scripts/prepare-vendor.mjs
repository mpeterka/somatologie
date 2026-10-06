import { cpSync, mkdirSync } from 'node:fs';
const target = new URL('../dist/vendor/', import.meta.url);
const source = new URL('../node_modules/three/', import.meta.url);
mkdirSync(target, {recursive: true});
for (const path of ['build/three.module.js', 'build/three.core.js', 'LICENSE']) cpSync(new URL(path, source), new URL(path.split('/').at(-1), target));
for (const path of ['controls/OrbitControls.js', 'loaders/GLTFLoader.js', 'loaders/DRACOLoader.js', 'utils/BufferGeometryUtils.js', 'libs/draco/gltf']) {
  const dest = new URL(`addons/${path}`, target);
  mkdirSync(new URL('./', dest), {recursive: true});
  cpSync(new URL(`examples/jsm/${path}`, source), dest, {recursive: true});
}
console.log('Three.js a Draco připraveny lokálně.');
