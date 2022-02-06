import * as THREE from 'three';
let scene, renderer, camera;
init();
function init() {
  const container = document.querySelector('#container');
  const fov = 45; //fov — Camera frustum vertical field of view.
  const aspect = window.innerWidth / window.innerHeight; //Camera frustum aspect ratio.
  const near = 1; //Camera frustum near plane.
  const far = 1000; // Camera frustum far plane.
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  renderer = new THREE.WebGLRenderer({ wiframe: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
