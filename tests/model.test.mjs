import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { anatomicalId } from '../dist/model-utils.js';

test('identita více částí kosti se bere z její skupiny, ne sdílené geometrie', () => {
  const left = new THREE.Group(); left.userData.za_name = 'Femur.l';
  const right = new THREE.Group(); right.userData.za_name = 'Femur.r';
  const geometry = new THREE.BoxGeometry();
  const a = new THREE.Mesh(geometry), b = new THREE.Mesh(geometry);
  left.add(a); right.add(b);
  assert.equal(anatomicalId(a), 'Femur.l');
  assert.equal(anatomicalId(b), 'Femur.r');
  const nested = new THREE.Group(); nested.userData.za_name = 'Other bone';
  const child = new THREE.Mesh(geometry); nested.add(child); left.add(nested);
  assert.equal(anatomicalId(child), 'Other bone');
  assert.equal(anatomicalId(new THREE.Group()), null);
});
