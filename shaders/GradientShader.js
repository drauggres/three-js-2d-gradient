import * as THREE from "three";

let vertices = [];

function GradientShader() {
  return {
    uniforms: {
      vertices: { value: vertices },
      resolution: { value: new THREE.Vector2(400, 400) }
    },

    vertexShader: [
      "varying vec2 vUv;",

      "void main() {",
      "  vUv = uv;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}"
    ].join("\n"),

    fragmentShader: [
      "struct Vertex {",
      "  float x;",
      "  float y;",
      "  vec3 color;",
      "};",

      "uniform Vertex vertices[" + vertices.length + "];",
      "varying vec2 vUv;",

      "vec3 screenBlending(vec3 color1, vec3 color2) {",
      "  float r = 1.0 - (1.0 - color2.r) * (1.0 - color1.r);",
      "  float g = 1.0 - (1.0 - color2.g) * (1.0 - color1.g);",
      "  float b = 1.0 - (1.0 - color2.b) * (1.0 - color1.b);",
      "  return vec3(r, g, b);",
      "}",

      // XYZ
      "float invCompand(float c) { return (c <= 0.04045) ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); }",
      "float compand(float c) { return (c <= 0.0031308) ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055; }",

      "vec3 RGB_to_XYZ(vec3 c) {",
      "  float invR = invCompand(c.r);",
      "  float invG = invCompand(c.g);",
      "  float invB = invCompand(c.b);",
      "  float x = 0.4124 * invR + 0.3576 * invG + 0.1805 * invB;",
      "  float y = 0.2126 * invR + 0.7152 * invG + 0.0722 * invB;",
      "  float z = 0.0193 * invR + 0.1192 * invG + 0.9505 * invB;",
      "  return vec3(x, y, z);",
      "}",

      "vec3 XYZ_to_RGB(vec3 c) {",
      "  float invR = 3.2406254773200533 * c.x - 1.5372079722103187 * c.y - 0.4986285986982479 * c.z;",
      "  float invG = -0.9689307147293197 * c.x + 1.8757560608852415 * c.y + 0.041517523842953964 * c.z;",
      "  float invB = 0.055710120445510616 * c.x + -0.2040210505984867 * c.y + 1.0569959422543882 * c.z;",
      "  float r = compand(invR);",
      "  float g = compand(invG);",
      "  float b = compand(invB);",
      "  return vec3(r, g, b);",
      "}",

      "void main() {",
      // "  vec2 position = vUv.xy / vec2(0.1).xy - vec2(4.5).xy;",
      "  vec3 color = vec3(0, 0, 0);",
      "  float sumDistance = 0.0;",
      "  for(int i = 0; i < " + vertices.length + "; i++) {",
      "    float currentDistance = pow(vertices[i].y - vUv.y, 2.0) + pow(vertices[i].x - vUv.x, 2.0);",
      "    sumDistance += currentDistance;",
      "  }",
      "  float t = 0.0;",
      "  for(int i = 0; i < " + vertices.length + "; i++) {",
      "    float currentDistance = pow(vertices[i].y - vUv.y, 2.0) + pow(vertices[i].x - vUv.x, 2.0);",
      "    float inverseDistance = 1.0 / (currentDistance / sumDistance);",
      "    t += inverseDistance;",
      "  }",
      "  for(int i = 0; i < " + vertices.length + "; i++) {",
      "    float currentDistance = pow(vertices[i].y - vUv.y, 2.0) + pow(vertices[i].x - vUv.x, 2.0);",
      "    float inverseDistance = 1.0 / (currentDistance / sumDistance);",
      "    float weight = inverseDistance / t;",
      "    weight = smoothstep(0.0, 1.0, weight);",
      "    color = XYZ_to_RGB(RGB_to_XYZ(color) + RGB_to_XYZ(vertices[i].color) * weight);",
      // "    color = screenBlending(color, vertices[i].color * weight);",
      "  }",

      "  gl_FragColor = vec4(color.rgb, 1.0);",
      "}"
    ].join("\n")

    // side: THREE.DoubleSide
    // blending: THREE.AdditiveBlending,
    // transparent: true,
    // depthWrite: false
  };
}

export { GradientShader, vertices };
