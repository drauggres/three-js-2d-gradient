import * as THREE from "three";
import { GradientShader } from "./shaders/GradientShader";
import { handlesInit, updateHandlePositions } from "./handles";
import "./color-picker";
import "./handles";

let camera;
let scene;
let renderer;
let mesh;

let padding = 200;

let threeCanvasBoundingBox;

function init() {
  camera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
  camera.position.z = 200;

  scene = new THREE.Scene();
  scene.background = null;

  let geometry = new THREE.PlaneGeometry(200, 200, 1);
  let material = new THREE.ShaderMaterial(GradientShader());
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
    antialias: true,
    alpha: true
  });

  renderer.domElement.classList.add("threejs-canvas");
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - padding, window.innerHeight - padding);
  threeCanvasBoundingBox = renderer.domElement.getBoundingClientRect();
  handlesInit();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate);
}

function animate() {
  // Animations go here
  // material.uniforms.vertices.value[0].x += 0.01;

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth - padding, window.innerHeight - padding);
  threeCanvasBoundingBox = renderer.domElement.getBoundingClientRect();
  updateHandlePositions();
}

init();

export { mesh, threeCanvasBoundingBox };
