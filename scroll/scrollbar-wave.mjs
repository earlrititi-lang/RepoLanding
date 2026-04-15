import * as THREE from "../three.js/node_modules/three/build/three.module.js";
import inlineScrollbarTexture from "./assets/scrollbarlateral.png";

/*
  Este archivo es la fuente del efecto.

  No se carga ya directamente en el navegador final de "scroll".
  Se usa como origen para generar un bundle local clasico que incluye
  Three.js dentro y evita depender de:
  - CDN
  - imports ES en runtime
  - la carpeta node_modules durante la ejecucion en navegador
*/

const stageSelector = "[data-wave-scrollbar-stage]";

function smoothstep(edge0, edge1, value) {
  const normalized = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return normalized * normalized * (3 - 2 * normalized);
}

function getVisibleSizeAtDepth(camera, depth) {
  const distance = Math.abs(camera.position.z - depth);
  const visibleHeight =
    2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;

  return {
    width: visibleHeight * camera.aspect,
    height: visibleHeight,
  };
}

function mountWaveScrollbar(stage) {
  const aspectRatio = parseFloat(stage.dataset.waveAspectRatio || "3.5555555556");
  const textureSource =
    !stage.dataset.waveTexture || stage.dataset.waveTexture === "./assets/scrollbarlateral.png"
      ? inlineScrollbarTexture
      : stage.dataset.waveTexture;

  stage.dataset.waveReady = "false";

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 80);
  camera.position.set(0.3, 0.02, 22);

  const ambient = new THREE.AmbientLight(0xffffff, 1.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
  keyLight.position.set(7.5, 4.2, 8.5);
  scene.add(keyLight);

  const coolLight = new THREE.DirectionalLight(0x9fc4ff, 1.05);
  coolLight.position.set(-7.2, 2.8, 4.5);
  scene.add(coolLight);

  const lowerFill = new THREE.PointLight(0xa4c7ff, 0.55, 45);
  lowerFill.position.set(2.2, -2.8, 7.4);
  scene.add(lowerFill);

  const root = new THREE.Group();
  scene.add(root);

  const rootLayout = {
    x: 0,
    y: 0,
    scale: 1,
  };

  const clothHeight = 5.8;
  const clothWidth = clothHeight * aspectRatio;
  const widthSegments = 230;
  const heightSegments = 60;

  const clothGeometry = new THREE.PlaneGeometry(
    clothWidth,
    clothHeight,
    widthSegments,
    heightSegments
  );

  clothGeometry.translate(clothWidth * 0.5, 0, 0);

  const clothMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0.02,
  });

  const clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
  clothMesh.frustumCulled = false;
  root.add(clothMesh);

  const positionAttribute = clothGeometry.attributes.position;
  const positions = positionAttribute.array;
  const basePositions = positions.slice();
  const startTime = performance.now();
  let textureReady = false;

  new THREE.TextureLoader().load(
    textureSource,
    function handleTextureLoad(texture) {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      clothMaterial.map = texture;
      clothMaterial.needsUpdate = true;
      textureReady = true;
      stage.dataset.waveReady = "true";
      resize();
    },
    undefined,
    function handleTextureError(error) {
      console.warn("No se pudo cargar la textura del scrollbar lateral.", error);
    }
  );

  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const visibleSize = getVisibleSizeAtDepth(camera, root.position.z);
    const coverScale =
      Math.max(visibleSize.width / clothWidth, visibleSize.height / clothHeight) * 1.04;

    if (!Number.isFinite(coverScale) || coverScale <= 0) {
      return;
    }

    rootLayout.scale = coverScale;
    rootLayout.x = -(clothWidth * rootLayout.scale) * 0.5;
    rootLayout.y = 0;

    root.scale.setScalar(rootLayout.scale);
    root.position.set(rootLayout.x, rootLayout.y, 0);
  }

  function deformRibbon(time) {
    for (let i = 0; i < positions.length; i += 3) {
      const baseX = basePositions[i];
      const baseY = basePositions[i + 1];
      const normalizedX = baseX / clothWidth;
      const normalizedY = baseY / (clothHeight * 0.5);
      const distanceToHorizontalEdge = 1 - Math.abs(normalizedY);

      const leftRelease = smoothstep(0.04, 0.22, normalizedX);
      const rightRelease = smoothstep(0.0, 0.16, 1 - normalizedX);
      const verticalRelease = smoothstep(0.02, 0.2, distanceToHorizontalEdge);
      const interior = leftRelease * verticalRelease * (0.55 + rightRelease * 0.45);
      const tail = Math.pow(normalizedX, 1.08);
      const tipZone = smoothstep(0.68, 0.96, normalizedX) * verticalRelease;

      const bellyWave = Math.sin(baseX * 0.92 - time * 1.9);
      const secondaryWave = Math.sin(baseX * 2.15 - time * 3.2 + baseY * 1.35);
      const flutterWave = Math.sin(baseX * 5.8 - time * 6.6 + baseY * 4.6);
      const shimmerWave =
        Math.sin(baseX * 10.8 - time * 9.8 + baseY * 7.4) *
        Math.cos(baseX * 4.4 + time * 6.4 - baseY * 3.6);
      const gustWave =
        Math.sin(time * 0.58 + baseX * 0.08) * 0.45 +
        Math.cos(time * 0.97 - baseY * 0.62) * 0.18;
      const tailSnap = Math.sin(time * 5.7 - baseY * 2.7) * Math.pow(normalizedX, 3.1);

      const zOffset =
        (bellyWave * 0.42 +
          secondaryWave * 0.12 +
          flutterWave * 0.035 +
          shimmerWave * 0.018 +
          gustWave * 0.16) *
          interior +
        tailSnap * 0.11 * tipZone;

      const yOffset =
        (secondaryWave * 0.05 + flutterWave * 0.02 + shimmerWave * 0.009) * interior -
        tail * 0.08 +
        Math.sin(time * 0.82 + normalizedX * 2.4) * 0.03 * verticalRelease +
        gustWave * 0.03 * verticalRelease;

      const xOffset =
        (bellyWave * 0.05 + gustWave * 0.035 + secondaryWave * 0.016) * interior -
        tail * 0.04;

      if (
        !Number.isFinite(xOffset) ||
        !Number.isFinite(yOffset) ||
        !Number.isFinite(zOffset)
      ) {
        continue;
      }

      positions[i] = baseX + xOffset;
      positions[i + 1] = baseY + yOffset;
      positions[i + 2] =
        zOffset +
        normalizedY * 0.06 * tail * Math.sin(time * 0.94 + baseX * 0.22) * verticalRelease;
    }

    positionAttribute.needsUpdate = true;
    clothGeometry.computeVertexNormals();
  }

  function animate() {
    const elapsed = (performance.now() - startTime) / 1000;

    deformRibbon(elapsed);

    root.rotation.y = -0.12 + Math.sin(elapsed * 0.24) * 0.018;
    root.rotation.x = -0.012 + Math.sin(elapsed * 0.19) * 0.006;
    root.scale.setScalar(rootLayout.scale);
    root.position.x = rootLayout.x;
    root.position.y = rootLayout.y + Math.sin(elapsed * 0.52) * 0.018 * rootLayout.scale;

    if (!textureReady) {
      return;
    }

    renderer.render(scene, camera);
  }

  resize();
  renderer.setAnimationLoop(animate);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener("resize", resize);
  }
}

const stages = Array.from(document.querySelectorAll(stageSelector));

if (!stages.length) {
  console.warn("No existe ningun contenedor con [data-wave-scrollbar-stage].");
} else {
  stages.forEach(mountWaveScrollbar);
}
