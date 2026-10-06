export function anatomicalId(object) {
  for (let node = object; node; node = node.parent) {
    if (node.userData?.za_name) return node.userData.za_name;
  }
  return null;
}
