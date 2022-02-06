import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.rotation.order = 'YXZ';

const ambientlight = new THREE.AmbientLight(0x6688cc);
scene.add(ambientlight);

const fillLight1 = new THREE.DirectionalLight(0xff9999, 0.5);
fillLight1.position.set(-1, 1, 2);
scene.add(fillLight1);

const fillLight2 = new THREE.DirectionalLight(0x8888ff, 0.2);
fillLight2.position.set(0, -1, 0);
scene.add(fillLight2);

const directionalLight = new THREE.DirectionalLight(0xffffaa, 1.2);
directionalLight.position.set(-5, 25, -1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = -0.00006;
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const container = document.getElementById('container');

container.appendChild(renderer.domElement);

const GRAVITY = 50;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.1;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x888855,
  roughness: 0.8,
  metalness: 0.5,
});

const spheres = [];

for (let i = 0; i < NUM_SPHERES; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
 
  scene.add(sphere);

  spheres.push({
    mesh: sphere,
    collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
    velocity: new THREE.Vector3(),
  });
}

const worldOctree = new Octree();

const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1, 0),
  0.35
);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;

const keyStates = {};

document.addEventListener('keydown', (event) => {
  document.body.requestPointerLock();
  keyStates[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  keyStates[event.code] = false;
});

document.body.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === document.body) {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
  }
});

function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);

  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0;

    if (!playerOnFloor) {
      playerVelocity.addScaledVector(
        result.normal,
        -result.normal.dot(playerVelocity)
      );
    }

    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

function updatePlayer(deltaTime) {
  let damping = Math.exp(-4 * deltaTime) - 1;

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime;

    damping *= 0.1;
  }

  playerVelocity.addScaledVector(playerVelocity, damping);

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);

  playerCollisions();

  camera.position.copy(playerCollider.end);
}

function getForwardVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();

  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);

  return playerDirection;
}

function controls(deltaTime) {
  // gives a bit of air control
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

  if (keyStates['KeyW']) {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  }

  if (keyStates['KeyS']) {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  }

  if (keyStates['KeyA']) {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  }

  if (keyStates['KeyD']) {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  }

  if (playerOnFloor) {
    if (keyStates['Space']) {
      playerVelocity.y = 15;
    }
  }
}

const loader = new GLTFLoader().setPath('./models/gltf/');

loader.load('collision-world.glb', (gltf) => {
  scene.add(gltf.scene);

  worldOctree.fromGraphNode(gltf.scene);

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material.map) {
        child.material.map.anisotropy = 8;
      }
    }
  });

  animate();
});

function animate() {
  const deltaTime = 0.0029;

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    controls(deltaTime);

    updatePlayer(deltaTime);
  }

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
