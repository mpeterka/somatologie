import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { anatomicalId } from './model-utils.js';

export async function createViewer(container, modelUrl, muscles = false) {
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x132532, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute('aria-label', '3D anatomický model. Otáčení tažením, přiblížení kolečkem nebo gestem dvou prstů.');
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    container.dispatchEvent(new CustomEvent('viewererror', {detail: '3D zobrazení bylo přerušeno. Obnovte stránku.'}));
  });
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.005, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = true;
  controls.minDistance = 0.08;
  controls.maxDistance = 8;
  scene.add(new THREE.HemisphereLight(0xf2f8ff, 0x698ba0, 2.5));
  const key = new THREE.DirectionalLight(0xfff5dd, 3.3);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ccee8, 2);
  rim.position.set(-2, 1, -3);
  scene.add(rim);
  const neutral = new THREE.MeshStandardMaterial({color: muscles ? 0xb67770 : 0xd8dcd6, roughness: 0.72, metalness: 0, side: THREE.DoubleSide});
  const selected = new THREE.MeshStandardMaterial({color: 0xffbc42, emissive: 0xc7790e, emissiveIntensity: 0.38, roughness: 0.56, side: THREE.DoubleSide, depthTest: false});
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('./vendor/addons/libs/draco/gltf/', import.meta.url).href);
  draco.setDecoderConfig({type: 'wasm'});
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let gltf;
  let timeout;
  try {
    gltf = await Promise.race([
      loader.loadAsync(modelUrl),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Načtení modelu trvá příliš dlouho. Obnovte stránku.')), 30000); })
    ]);
  } catch (error) {
    controls.dispose(); neutral.dispose(); selected.dispose(); renderer.dispose(); renderer.domElement.remove(); draco.dispose();
    throw error;
  } finally { clearTimeout(timeout); }
  draco.dispose();
  const meshById = new Map();
  const allMeshes = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(object => { if (object.isMesh) { object.userData.za_name = anatomicalId(object); allMeshes.push(object); } });
  const originalMaterials = new Set(allMeshes.flatMap(mesh => Array.isArray(mesh.material) ? mesh.material : [mesh.material]));
  for (const material of originalMaterials) {
    for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
    material.dispose();
  }
  // Attach preserves each world transform and removes anatomical containment
  // from the rendering hierarchy. Identity is never derived from shared geometry.
  for (const mesh of allMeshes) {
    scene.attach(mesh);
    const id = mesh.userData.za_name;
    mesh.visible = muscles ? !/fascia|tendon|bursa|sheath|aponeurosis|retinaculum/i.test(id || '') : !/cells of ethmoid|Sinus of|cartilage|process of nasal septal/i.test(id || '');
    mesh.material = neutral;
    if (id) {
      if (!meshById.has(id)) meshById.set(id, []);
      meshById.get(id).push(mesh);
    }
  }
  const bodyBox = new THREE.Box3();
  for (const mesh of allMeshes.filter(m => m.visible)) bodyBox.expandByObject(mesh);
  let active = [];
  let fullView = true;
  let observer;
  function render() { renderer.render(scene, camera); }
  function fit(box, front = true) {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = Math.max(size.y, size.x / Math.max(camera.aspect, 0.1), size.z, 0.08) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.22;
    const direction = front ? new THREE.Vector3(0, 0.04, 1).normalize() : camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.update(); render();
  }
  function resize() {
    const {width, height} = container.getBoundingClientRect();
    renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    if (fullView) fit(bodyBox);
    render();
  }
  observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  renderer.setAnimationLoop(() => { controls.update(); render(); });
  renderer.domElement.addEventListener('pointerdown', () => { fullView = false; });
  renderer.domElement.addEventListener('wheel', () => { fullView = false; }, {passive: true});
  function lookup(ids) {
    if (!ids.length || ids.some(id => !meshById.has(id))) throw new Error('Otázka nemá odpovídající 3D model.');
    return ids.flatMap(id => meshById.get(id));
  }
  return {
    validate(bones) { for (const bone of bones) lookup(bone.meshIds); },
    highlight(ids) {
      const next = ids.length ? lookup(ids) : [];
      for (const mesh of active) { mesh.material = neutral; mesh.renderOrder = 0; }
      active = next;
      for (const mesh of active) { mesh.visible = true; mesh.material = selected; mesh.renderOrder = 10; }
      render();
    },
    resetView() { fullView = true; fit(bodyBox); },
    focus(ids) {
      const box = new THREE.Box3();
      for (const mesh of lookup(ids)) box.expandByObject(mesh);
      fullView = false; fit(box, false);
    },
    turnBack() {
      fullView = false;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
      camera.position.copy(controls.target).add(offset); controls.update(); render();
    },
    isolate(enabled) {
      neutral.transparent = enabled;
      neutral.opacity = enabled ? 0.17 : 1;
      neutral.depthWrite = !enabled;
      neutral.needsUpdate = true;
      render();
    },
    dispose() {
      observer.disconnect(); controls.dispose(); renderer.setAnimationLoop(null);
      for (const geometry of new Set(allMeshes.map(m => m.geometry))) geometry.dispose();
      neutral.dispose(); selected.dispose(); renderer.dispose(); renderer.domElement.remove();
    }
  };
}
