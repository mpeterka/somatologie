import * as THREE from 'three';

// Model axes: +Y towards the head, +Z anterior, -X anatomical right.
export function createOrientationOverlay(item, bodyBox, bodyMeshes = []) {
  const group = new THREE.Group();
  const height = bodyBox.max.y - bodyBox.min.y;
  const center = bodyBox.getCenter(new THREE.Vector3());
  const point = (x, y, z = 0) => new THREE.Vector3(center.x + x * height, bodyBox.min.y + y * height, center.z + z * height);
  const gold = new THREE.MeshBasicMaterial({color: 0xffbc42, toneMapped: false, depthTest: false});
  const result = {group, view: new THREE.Vector3(0, .04, 1), caption: 'Anatomická poloha · strany z pohledu těla'};
  const add = (geometry, material, position) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position); mesh.renderOrder = 20; group.add(mesh); return mesh;
  };
  function arrow(start, end) {
    const direction = end.clone().sub(start).normalize();
    const length = start.distanceTo(end);
    const head = Math.min(height * .035, length * .3);
    const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    const shaft = add(new THREE.CylinderGeometry(height * .004, height * .004, length - head, 12), gold, start.clone().addScaledVector(direction, (length - head) / 2));
    shaft.quaternion.copy(rotation);
    shaft.renderOrder = 30;
    const tip = add(new THREE.ConeGeometry(height * .015, head, 20), gold, end.clone().addScaledVector(direction, -head / 2));
    tip.quaternion.copy(rotation);
    tip.renderOrder = 30;
    result.direction = direction;
  }
  // Landmarks of the single-mesh BodyParts3D surface, relative to body height.
  const forearm = point(-.15, .52);
  const calf = point(-.06, .2);
  const hand = point(-.165, .46, .02);
  const foot = point(-.06, .04, .04);
  const id = item.id;
  if (['sagittalis', 'frontalis', 'transversalis'].includes(id)) {
    result.normal = new THREE.Vector3(...({sagittalis: [1, 0, 0], frontalis: [0, 0, 1], transversalis: [0, 1, 0]}[id]));
    const width = id === 'sagittalis' ? height * .32 : height * .65;
    const planeHeight = id === 'transversalis' ? height * .35 : height * 1.05;
    const material = new THREE.MeshBasicMaterial({color: 0xffc966, transparent: true, opacity: .23, side: THREE.DoubleSide, depthWrite: false});
    const plane = add(new THREE.PlaneGeometry(width, planeHeight), material, point(0, .52));
    plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), result.normal);
    const border = new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry), new THREE.LineBasicMaterial({color: 0xffc966}));
    plane.add(border);
    result.view.set(.8, .15, 1);
    result.caption = 'Průhledná rovina protíná tělo · otáčej pro další pohled';
  } else if (['dexter', 'sinister'].includes(id)) {
    if (bodyMeshes.length) {
      const normal = new THREE.Vector3(id === 'dexter' ? -1 : 1, 0, 0);
      const material = gold.clone();
      material.clippingPlanes = [new THREE.Plane(normal, -normal.x * center.x)];
      for (const body of bodyMeshes) {
        const half = new THREE.Mesh(body.geometry, material);
        half.matrix.copy(body.matrixWorld); half.matrixAutoUpdate = false;
        half.userData.borrowedGeometry = true; half.renderOrder = 21; group.add(half);
      }
    }
    // A central reference line distinguishes a side from a direction arrow.
    add(new THREE.CylinderGeometry(height * .0015, height * .0015, height, 8), gold, point(0, .5, .09));
    result.caption = 'Zlatě zvýrazněná strana těla · pohled zepředu';
  } else if (['superficialis', 'profundus'].includes(id)) {
    const sliceCenter = point(.34, .64, .04);
    for (const [z, thickness, color] of [[.06, .02, 0xd9b89c], [.015, .07, 0xcba754], [-.07, .1, 0xa96969]]) {
      add(new THREE.BoxGeometry(height * .17, height * .17, height * thickness), new THREE.MeshStandardMaterial({color, roughness: .8}), sliceCenter.clone().add(new THREE.Vector3(0, 0, z * height)));
    }
    const outer = sliceCenter.clone().add(new THREE.Vector3(0, 0, .14 * height));
    const inner = sliceCenter.clone().add(new THREE.Vector3(0, 0, -.09 * height));
    arrow(...(id === 'profundus' ? [outer, inner] : [inner, outer]));
    result.view.set(.85, .3, 1);
    result.caption = 'Detail: řez tkáněmi · světlá vrstva je povrch těla';
  } else {
    const forward = new THREE.Vector3(0, 0, height * .09);
    const a = forearm.clone().add(forward);
    const b = calf.clone().add(forward);
    const displacement = (start, xyz) => start.clone().add(new THREE.Vector3(...xyz).multiplyScalar(height));
    const arrows = {
      cranialis: [point(-.27, .57, .04), point(-.27, .89, .04)],
      caudalis: [point(-.27, .57, .04), point(-.27, .25, .04)],
      ventralis: [point(.2, .62, 0), point(.2, .62, .25)],
      dorsalis: [point(.2, .62, 0), point(.2, .62, -.25)],
      medialis: [point(.22, .65, .13), point(.01, .65, .13)],
      lateralis: [point(.01, .65, .13), point(.22, .65, .13)],
      proximalis: [a, displacement(a, [.035, .16, 0])],
      distalis: [a, displacement(a, [-.035, -.16, 0])],
      radialis: [a, displacement(a, [-.07, 0, 0])],
      ulnaris: [a, displacement(a, [.07, 0, 0])],
      tibialis: [b, displacement(b, [.06, 0, 0])],
      fibularis: [b, displacement(b, [-.06, 0, 0])],
      palmaris: [hand.clone().add(new THREE.Vector3(0, 0, height * .17)), hand.clone().add(new THREE.Vector3(0, 0, height * .025))],
      plantaris: [foot.clone().add(new THREE.Vector3(0, -height * .12, 0)), foot.clone().add(new THREE.Vector3(0, -height * .02, 0))]
    };
    if (!arrows[id]) throw new Error(`Missing 3D direction: ${id}`);
    arrow(...arrows[id]);
    if (['ventralis', 'dorsalis'].includes(id)) result.view.set(.95, .08, 1);
    if (['radialis', 'ulnaris', 'palmaris', 'tibialis', 'fibularis', 'plantaris'].includes(id)) {
      const anchor = ['tibialis', 'fibularis'].includes(id) ? calf : id === 'plantaris' ? foot : forearm;
      result.focusBox = new THREE.Box3().setFromCenterAndSize(anchor, new THREE.Vector3(.32, .4, .3).multiplyScalar(height));
      result.caption = id === 'plantaris' ? 'Detail pravé nohy · šipka označuje stranu' : ['tibialis', 'fibularis'].includes(id) ? 'Detail pravého bérce · strany z pohledu těla' : 'Detail pravého předloktí a ruky · dlaň vpřed';
      if (id === 'plantaris') result.view.set(.9, -.25, 1);
      if (id === 'palmaris') result.view.set(.8, .05, 1);
    }
  }
  group.updateMatrixWorld(true);
  result.frameBox = bodyBox.clone().union(new THREE.Box3().setFromObject(group));
  result.dispose = () => {
    const geometries = new Set(), materials = new Set([gold]);
    group.traverse(object => {
      if (object.geometry && !object.userData.borrowedGeometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    group.removeFromParent(); group.clear();
  };
  return result;
}
