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
  camera.position.set(1, 2, -3);
  scene = new THREE.Scene();
  camera.lookAt(0, 1, 0);
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

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
