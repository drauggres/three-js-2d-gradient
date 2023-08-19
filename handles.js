import * as THREE from "three";
import { picker, pickerElement } from "./color-picker";
import { mesh, threeCanvasBoundingBox } from "./index";
import { GradientShader, vertices } from "./shaders/GradientShader";

let addButton = document.querySelector(".add-button");
let removeButton = document.querySelector(".remove-button");
let draging = false;
let dragHandle = null;
let dragOffset = { x: 0, y: 0 };
let dragBoundingBox;

addButton.addEventListener("click", createHandle);
removeButton.addEventListener("click", removeHandle);

function createHandle(options) {
  let handle = document.createElement("div");
  handle.classList.add("handle");
  let glslCoordinates = { x: 0.5, y: 0.5 };
  if (options) {
    if (options.handleX && options.handleY) {
      glslCoordinates = { x: options.handleX, y: options.handleY };
    }
  }
  let coordinates = GLSLToPageCoordinates(glslCoordinates);
  handle.style.top = coordinates.y + 10;
  handle.style.left = coordinates.x - 5;

  handle.addEventListener("mousedown", function (event) {
    dragBoundingBox = this.getBoundingClientRect();
    Array.from(document.querySelectorAll(".handle-selected")).forEach((element) => {
      element.classList.remove("handle-selected");
    });
    this.classList.add("handle-selected");
    dragOffset.x = dragBoundingBox.left - event.clientX;
    dragOffset.y = dragBoundingBox.top - event.clientY;
    dragHandle = this;
    let color = handle.getAttribute("color");
    picker.color = color;
    draging = true;
  });

  Array.from(document.querySelectorAll(".handle-selected")).forEach((element) => {
    element.classList.remove("handle-selected");
  });
  handle.classList.add("handle-selected");

  let color = randomColor();
  if (options) if (options.handleColor) color = options.handleColor;
  handle.setAttribute("color", color);

  vertices.push({
    x: glslCoordinates.x,
    y: glslCoordinates.y,
    color: new THREE.Color(color)
  });
  handle.setAttribute("index", vertices.length - 1);
  mesh.material = new THREE.ShaderMaterial(GradientShader());

  dragHandle = handle;
  picker.color = color;

  if (pickerElement.style.display === "none") pickerElement.style.display = "";
  if (removeButton.style.display === "none") removeButton.style.display = "";

  document.body.appendChild(handle);
}

function removeHandle() {
  vertices.splice(dragHandle.getAttribute("index"), 1);
  dragHandle.parentElement.removeChild(dragHandle);
  let handles = document.querySelectorAll(".handle");
  if (!handles.length) {
    pickerElement.style.display = "none";
    removeButton.style.display = "none";
  } else {
    let visitedVertices = [];
    for (let i = 0; i < handles.length; i++) {
      let color = new THREE.Color(handles[i].getAttribute("color"));
      for (let j = 0; j < vertices.length; j++) {
        if (vertices[j].color.equals(color) && !visitedVertices.includes(j)) {
          handles[i].setAttribute("index", j);
          visitedVertices.push(j);
          break;
        }
      }
    }
    dragBoundingBox = handles[0].getBoundingClientRect();
    Array.from(document.querySelectorAll(".handle-selected")).forEach((element) => {
      element.classList.remove("handle-selected");
    });
    handles[0].classList.add("handle-selected");
    dragHandle = handles[0];
    let color = handles[0].getAttribute("color");
    picker.color = color;
  }

  console.log(vertices);

  mesh.material = new THREE.ShaderMaterial(GradientShader());
}

window.addEventListener("mouseup", function () {
  draging = false;
});

window.addEventListener("mousemove", function (event) {
  if (!draging) return;
  let coordinates = pageToGLSLCoordinates({
    x: event.clientX + dragOffset.x + dragBoundingBox.width / 2,
    y: event.clientY + dragOffset.y + dragBoundingBox.height / 2
  });

  if (coordinates.y !== -1 && coordinates.y !== -2) {
    dragHandle.style.top = event.clientY + dragOffset.y;
  } else {
    if (coordinates.y === -1) {
      coordinates.y = 0;
      dragHandle.style.top =
        threeCanvasBoundingBox.top + threeCanvasBoundingBox.height - dragBoundingBox.height / 2;
    } else {
      coordinates.y = 1;
      dragHandle.style.top = threeCanvasBoundingBox.top - dragBoundingBox.height / 2;
    }
  }
  if (coordinates.x !== -1 && coordinates.x !== -2) {
    dragHandle.style.left = event.clientX + dragOffset.x;
  } else {
    if (coordinates.x === -1) {
      coordinates.x = 0;
      dragHandle.style.left = threeCanvasBoundingBox.left - dragBoundingBox.width / 2;
    } else {
      coordinates.x = 1;
      dragHandle.style.left =
        threeCanvasBoundingBox.left + threeCanvasBoundingBox.width - dragBoundingBox.width / 2;
    }
  }

  let vertex = mesh.material.uniforms.vertices.value[dragHandle.getAttribute("index")];
  vertex.x = coordinates.x;
  vertex.y = coordinates.y;
});

picker.on("change", (picker, color) => {
  pickerElement.style.backgroundColor = color;
  if (!dragHandle) return;
  dragHandle.setAttribute("color", color);
  let vertex = mesh.material.uniforms.vertices.value[dragHandle.getAttribute("index")];
  vertex.color = new THREE.Color(color);
});

function GLSLToPageCoordinates(coordinates) {
  let newCoordinates = {};
  newCoordinates.x = threeCanvasBoundingBox.left + coordinates.x * threeCanvasBoundingBox.width;
  newCoordinates.y =
    threeCanvasBoundingBox.top + (1 - coordinates.y) * threeCanvasBoundingBox.height;
  return newCoordinates;
}

function pageToGLSLCoordinates(coordinates) {
  let newCoordinates = {};
  newCoordinates.x = (coordinates.x - threeCanvasBoundingBox.left) / threeCanvasBoundingBox.width;
  newCoordinates.y =
    1 - (coordinates.y - threeCanvasBoundingBox.top) / threeCanvasBoundingBox.height;
  if (coordinates.x < threeCanvasBoundingBox.left) newCoordinates.x = -1;
  if (coordinates.x > threeCanvasBoundingBox.left + threeCanvasBoundingBox.width)
    newCoordinates.x = -2;
  if (coordinates.y > threeCanvasBoundingBox.top + threeCanvasBoundingBox.height)
    newCoordinates.y = -1;
  if (coordinates.y < threeCanvasBoundingBox.top) newCoordinates.y = -2;
  return newCoordinates;
}

function updateHandlePositions() {
  let handles = document.querySelectorAll(".handle");
  if (!handles.length) return;
  let boundingBox = handles[0].getBoundingClientRect();

  for (let i = 0; i < handles.length; i++) {
    let vertex = mesh.material.uniforms.vertices.value[handles[i].getAttribute("index")];
    let coordinates = GLSLToPageCoordinates({ x: vertex.x, y: vertex.y });

    handles[i].style.top = coordinates.y - boundingBox.height / 2;
    handles[i].style.left = coordinates.x - boundingBox.width / 2;
  }
}

function randomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

function handlesInit() {
  createHandle({
    handleX: 0.2,
    handleY: 0.2,
    handleColor: "#5900ff"
  });

  createHandle({
    handleX: 0.8,
    handleY: 0.2,
    handleColor: "#ae00ff"
  });

  createHandle({
    handleX: 0.2,
    handleY: 0.8,
    handleColor: "#ff5900"
  });

  createHandle({
    handleX: 0.8,
    handleY: 0.8,
    handleColor: "#ff0000"
  });
}

export { handlesInit, updateHandlePositions };
