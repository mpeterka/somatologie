import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { createOrientationOverlay } from '../dist/orientation.js';

test('every orientation creates finite 3D geometry and disposes when removed', () => {
  const items = JSON.parse(readFileSync(new URL('../dist/directions.json', import.meta.url)));
  const box = new THREE.Box3(new THREE.Vector3(-.4, 0, -.12), new THREE.Vector3(.4, 1.8, .12));
  for (const item of items) {
    const overlay = createOrientationOverlay(item, box);
    assert.ok(overlay.group.children.length > 0, item.id);
    overlay.group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(overlay.group);
    assert.ok([...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite), item.id);
    overlay.dispose();
    assert.equal(overlay.group.children.length, 0);
  }
});

test('planes and arrows preserve anatomical axes', () => {
  const box = new THREE.Box3(new THREE.Vector3(-.4, 0, -.12), new THREE.Vector3(.4, 1.8, .12));
  const get = id => createOrientationOverlay({id}, box);
  assert.deepEqual(get('sagittalis').normal.toArray(), [1, 0, 0]);
  assert.deepEqual(get('frontalis').normal.toArray(), [0, 0, 1]);
  assert.deepEqual(get('transversalis').normal.toArray(), [0, 1, 0]);
  assert.ok(get('cranialis').direction.y > 0);
  assert.ok(get('caudalis').direction.y < 0);
  assert.ok(get('ventralis').direction.z > 0);
  assert.ok(get('dorsalis').direction.z < 0);
  assert.ok(get('radialis').direction.x < 0); // anatomical right forearm
  assert.ok(get('ulnaris').direction.x > 0);
  assert.ok(get('tibialis').direction.x > 0);
  assert.ok(get('fibularis').direction.x < 0);
  assert.ok(get('profundus').direction.z < 0);
  assert.ok(get('superficialis').direction.z > 0);
  assert.equal(get('profundus').group.children.filter(mesh => mesh.renderOrder === 30).length, 2);
});

test('side highlight clips the correct half and keeps borrowed body geometry alive', () => {
  const geometry = new THREE.BoxGeometry(.8, 1.8, .24);
  const body = new THREE.Mesh(geometry);
  body.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(body);
  let disposed = false;
  geometry.addEventListener('dispose', () => { disposed = true; });
  for (const id of ['dexter', 'sinister']) {
    const overlay = createOrientationOverlay({id}, box, [body]);
    const half = overlay.group.children.find(mesh => mesh.userData.borrowedGeometry);
    const plane = half.material.clippingPlanes[0];
    const x = id === 'dexter' ? -.2 : .2;
    assert.ok(plane.distanceToPoint(new THREE.Vector3(x, 0, 0)) > 0);
    assert.ok(plane.distanceToPoint(new THREE.Vector3(-x, 0, 0)) < 0);
    overlay.dispose();
    assert.equal(disposed, false);
  }
  geometry.dispose(); body.material.dispose();
});
