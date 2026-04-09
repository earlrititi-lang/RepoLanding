import * as THREE from "three";

/*
  GUIA RAPIDA PARA CLASE
  ----------------------
  Este archivo hace cuatro cosas:

  1. Encuentra un contenedor del DOM donde inyectar un canvas.
  2. Crea una escena de Three.js con camara, luces y una malla plana.
  3. Aplica image.png como textura sobre esa malla.
  4. Deforma los vertices en cada frame para simular una tela ondeando.

  Version actualizada:
  - Three.js se importa como modulo ES.
  - El proyecto arranca con Vite.
  - El color management usa la API moderna.

  Idea clave para alumnos:
  no estamos animando una imagen. Estamos animando una malla 3D que lleva una
  imagen pegada encima como textura.
*/

const stage = document.querySelector("[data-flag-stage]");

if (!stage) {
  console.warn("No existe ningun contenedor con [data-flag-stage].");
} else {
  /*
    El renderer dibuja la escena en un canvas WebGL.
    - antialias suaviza bordes.
    - alpha deja que el fondo CSS se vea detras.
    - powerPreference intenta priorizar una GPU rapida cuando se puede.
  */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  /*
    Ajustes de calidad y color:
    - limitamos pixelRatio a 2 para no disparar coste en pantallas retina.
    - outputColorSpace corrige como el renderer interpreta y muestra el color.
  */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  /*
    Escena y camara:
    - Scene es el contenedor de lo 3D.
    - PerspectiveCamera da profundidad real y un encuadre creible.
  */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
  camera.position.set(0.45, 0.1, 11.6);

  /*
    Luces:
    - AmbientLight evita negros muy duros.
    - DirectionalLight principal crea el volumen fuerte.
    - Otra direccional azulada integra la bandera con el fondo.
    - PointLight inferior rellena la parte baja.

    Sin luces, la deformacion existe, pero el ojo la lee mucho peor.
  */
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 3.5, 7.5);
  scene.add(keyLight);

  const coolLight = new THREE.DirectionalLight(0xa8d4ff, 1.05);
  coolLight.position.set(-5.5, 2.2, 3.2);
  scene.add(coolLight);

  const lowerFill = new THREE.PointLight(0xbfdcff, 0.55, 30);
  lowerFill.position.set(1.2, -2.2, 5);
  scene.add(lowerFill);

  /*
    root agrupa toda la bandera.
    Asi podemos mover, rotar y escalar el conjunto sin recalcular cada pieza.
  */
  const root = new THREE.Group();
  scene.add(root);

  /*
    rootLayout guarda la colocacion base decidida por resize().
    animate() anade movimiento encima de esa base sin romper el ajuste responsive.
  */
  const rootLayout = {
    x: 0,
    y: 0,
    scale: 1,
  };

  /*
    Parametros de la tela:
    - clothWidth / clothHeight definen el formato de la malla.
    - widthSegments / heightSegments determinan cuantos vertices hay.

    Regla para alumnos:
    si no hay suficientes segmentos, no hay suficiente geometria para doblar.
  */
  const clothWidth = 9.6;
  const clothHeight = 5.55;
  const widthSegments = 132;
  const heightSegments = 78;

  const clothGeometry = new THREE.PlaneGeometry(
    clothWidth,
    clothHeight,
    widthSegments,
    heightSegments
  );

  /*
    PlaneGeometry nace centrada. La desplazamos media anchura a la derecha para
    que el borde izquierdo quede en x = 0 y podamos tratarlo como anclaje.
  */
  clothGeometry.translate(clothWidth * 0.5, 0, 0);

  /*
    La textura ya no depende de un fallback global. Vite resuelve esta URL al
    servir y al compilar.
  */
  const textureSource = new URL("./image.png", import.meta.url).href;
  const texture = new THREE.TextureLoader().load(textureSource);

  /*
    anisotropy mejora la lectura cuando la tela se inclina.
    ClampToEdge evita repeticion en los bordes.
    colorSpace corrige la interpretacion del color en la API moderna.
  */
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  /*
    MeshStandardMaterial responde a la luz, por eso se aprecian los pliegues.
    DoubleSide evita que desaparezca la cara trasera cuando el panio rota.
  */
  const clothMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    roughness: 0.88,
    metalness: 0.01,
  });

  const clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
  root.add(clothMesh);

  /*
    La sombra no usa shadow maps reales.
    Se construye con dos planos y texturas suaves generadas por canvas:
    - una sombra amplia para el volumen general,
    - una sombra de contacto mas compacta.
  */
  const shadowGroup = new THREE.Group();
  scene.add(shadowGroup);

  function createShadowTexture(config) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    const radial = ctx.createRadialGradient(
      canvas.width * config.innerX,
      canvas.height * config.innerY,
      canvas.height * config.innerRadius,
      canvas.width * config.outerX,
      canvas.height * config.outerY,
      canvas.width * config.outerRadius
    );

    radial.addColorStop(0, `rgba(26, 43, 71, ${config.centerAlpha})`);
    radial.addColorStop(0.45, `rgba(30, 49, 79, ${config.midAlpha})`);
    radial.addColorStop(1, "rgba(30, 49, 79, 0)");

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shadowTexture = new THREE.CanvasTexture(canvas);
    shadowTexture.needsUpdate = true;

    return shadowTexture;
  }

  const broadShadowTexture = createShadowTexture({
    innerX: 0.4,
    innerY: 0.5,
    innerRadius: 0.06,
    outerX: 0.48,
    outerY: 0.5,
    outerRadius: 0.5,
    centerAlpha: 0.9,
    midAlpha: 0.32,
  });

  const contactShadowTexture = createShadowTexture({
    innerX: 0.22,
    innerY: 0.5,
    innerRadius: 0.04,
    outerX: 0.26,
    outerY: 0.5,
    outerRadius: 0.28,
    centerAlpha: 0.88,
    midAlpha: 0.26,
  });

  const broadShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      map: broadShadowTexture,
      color: 0x35507a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  broadShadow.position.z = -0.75;
  shadowGroup.add(broadShadow);

  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      color: 0x274365,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  contactShadow.position.z = -0.72;
  shadowGroup.add(contactShadow);

  /*
    positions es el array vivo de vertices.
    basePositions es una copia del estado original.

    Sin basePositions la deformacion se acumularia frame a frame y la malla se
    acabaria rompiendo.
  */
  const positionAttribute = clothGeometry.attributes.position;
  const positions = positionAttribute.array;
  const basePositions = positions.slice();
  const clock = new THREE.Clock();

  function smoothstep(edge0, edge1, value) {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return x * x * (3 - 2 * x);
  }

  /*
    Calcula el ancho y alto visibles por la camara a una profundidad concreta.
    Esto permite escalar la bandera como un cover responsive dentro del canvas.
  */
  function getVisibleSizeAtDepth(depth) {
    const distance = Math.abs(camera.position.z - depth);
    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;

    return {
      width: visibleHeight * camera.aspect,
      height: visibleHeight,
    };
  }

  /*
    resize sincroniza DOM y WebGL.
    - actualiza renderer y camara
    - calcula el area visible
    - aplica una escala tipo cover
  */
  function resize() {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const visibleSize = getVisibleSizeAtDepth(root.position.z);
    const coverScale =
      Math.max(visibleSize.width / clothWidth, visibleSize.height / clothHeight) * 1.06;

    rootLayout.scale = coverScale;
    rootLayout.x = -(clothWidth * coverScale) * 0.5;
    rootLayout.y = 0;

    root.scale.setScalar(rootLayout.scale);
    root.position.set(rootLayout.x, rootLayout.y, 0);

    broadShadow.scale.set(
      clothWidth * rootLayout.scale * 0.95,
      clothHeight * rootLayout.scale * 0.74,
      1
    );

    contactShadow.scale.set(
      clothWidth * rootLayout.scale * 0.42,
      clothHeight * rootLayout.scale * 0.92,
      1
    );
  }

  /*
    deformFlag es el corazon del efecto.
    Recorre todos los vertices y calcula offsets distintos para x, y y z.

    No hay una sola onda:
    - bellyWave: volumen principal
    - secondaryWave: rompe uniformidad
    - flutterWave: vibracion rapida
    - gustWave / gustPulse: cambios mas lentos de viento
    - chaosWave y microRipple: irregularidad fina
    - tipFlick: latigazo de la punta
  */
  function deformFlag(time) {
    for (let i = 0; i < positions.length; i += 3) {
      const baseX = basePositions[i];
      const baseY = basePositions[i + 1];
      const normalizedX = baseX / clothWidth;
      const normalizedY = baseY / (clothHeight * 0.5);
      const distanceToHorizontalEdge = 1 - Math.abs(normalizedY);

      /*
        Bordes mas rigidos:
        - izquierdo anclado
        - derecho con vida, pero contenido
        - arriba y abajo amortiguados
      */
      const leftRelease = smoothstep(0.06, 0.22, normalizedX);
      const rightRelease = smoothstep(0.0, 0.12, 1 - normalizedX);
      const verticalRelease = smoothstep(0.02, 0.22, distanceToHorizontalEdge);
      const interior = leftRelease * verticalRelease * (0.35 + rightRelease * 0.65);
      const tail = Math.pow(normalizedX, 1.18) * (0.45 + rightRelease * 0.55);
      const tipZone = smoothstep(0.58, 0.92, normalizedX) * verticalRelease * rightRelease;

      const bellyWave = Math.sin(baseX * 1.18 - time * 1.85);
      const secondaryWave = Math.sin(baseX * 2.95 - time * 3.75 + baseY * 1.15);
      const flutterWave = Math.sin(baseX * 6.4 - time * 7.1 + baseY * 5.2);
      const chaosWave =
        Math.sin(baseX * 4.2 - time * 2.45 + baseY * 2.7) *
        Math.cos(baseX * 1.25 + time * 1.1 - baseY * 1.4);
      const microRipple =
        Math.sin(baseX * 12.8 - time * 11.4 + baseY * 9.6) *
        Math.cos(baseX * 7.5 + time * 8.2 - baseY * 4.4);
      const gustWave =
        Math.sin(time * 0.62) * 0.52 +
        Math.sin(time * 1.26 + baseX * 0.22) * 0.2;
      const gustPulse =
        0.72 +
        (Math.sin(time * 0.33 + baseX * 0.09) * 0.18 +
          Math.sin(time * 0.91 - baseY * 0.45) * 0.1);
      const twistWave = Math.sin(time * 1.08 + baseX * 0.56 - baseY * 1.7);
      const tipFlick = Math.sin(time * 6.2 - baseY * 3.4) * Math.pow(normalizedX, 3.25);

      const zOffset =
        (bellyWave * 0.48 +
          secondaryWave * 0.14 +
          flutterWave * 0.035 +
          chaosWave * 0.1 +
          microRipple * 0.018 +
          gustWave * 0.2) *
          interior *
          gustPulse +
        tipFlick * 0.15 * tipZone * gustPulse;

      const yOffset =
        (secondaryWave * 0.065 +
          flutterWave * 0.026 +
          chaosWave * 0.032 +
          microRipple * 0.008) *
          interior *
          gustPulse -
        tail * 0.18 +
        Math.sin(time * 0.92 + normalizedX * 2.4) *
          0.06 *
          distanceToHorizontalEdge *
          interior +
        twistWave * 0.028 * tail;

      const xOffset =
        (bellyWave * 0.075 +
          gustWave * 0.055 +
          secondaryWave * 0.02 +
          chaosWave * 0.024 +
          microRipple * 0.006) *
          interior *
          gustPulse -
        tail * 0.06;

      positions[i] = baseX + xOffset;
      positions[i + 1] = baseY + yOffset;
      positions[i + 2] =
        zOffset + normalizedY * 0.14 * tail * twistWave * verticalRelease;
    }

    /*
      Avisamos a Three.js de que la geometria cambio y recalculamos normales
      para que la luz siga reaccionando a la nueva forma.
    */
    positionAttribute.needsUpdate = true;
    clothGeometry.computeVertexNormals();
  }

  /*
    animate:
    1. mide tiempo
    2. deforma vertices
    3. anade un movimiento suave al grupo completo
    4. actualiza la sombra
    5. renderiza
  */
  function animate() {
    const elapsed = clock.getElapsedTime();

    deformFlag(elapsed);

    root.rotation.y = -0.24 + Math.sin(elapsed * 0.24) * 0.04;
    root.rotation.x = -0.025 + Math.sin(elapsed * 0.18) * 0.01;
    root.scale.setScalar(rootLayout.scale);
    root.position.x = rootLayout.x;
    root.position.y = rootLayout.y + Math.sin(elapsed * 0.48) * 0.03 * rootLayout.scale;

    const swayY = root.rotation.y;
    const swayX = root.rotation.x;
    const lift = Math.abs(swayY) * 0.9 + Math.abs(swayX) * 1.6;

    shadowGroup.position.x =
      root.position.x + clothWidth * rootLayout.scale * 0.54 - swayY * 1.55;
    shadowGroup.position.y =
      root.position.y - clothHeight * rootLayout.scale * 0.05 - lift * 0.16;
    shadowGroup.rotation.x = root.rotation.x;
    shadowGroup.rotation.y = root.rotation.y;
    shadowGroup.rotation.z = root.rotation.z;

    broadShadow.rotation.x = swayX * 0.18;
    broadShadow.rotation.y = swayY * 0.08;
    broadShadow.rotation.z = swayY * -0.06;
    broadShadow.scale.x =
      clothWidth * rootLayout.scale * (0.95 + lift * 0.09 + Math.sin(elapsed * 0.38) * 0.01);
    broadShadow.scale.y =
      clothHeight * rootLayout.scale * (0.74 - lift * 0.05 + Math.cos(elapsed * 0.27) * 0.008);
    broadShadow.material.opacity = 0.22 - lift * 0.05;

    contactShadow.position.x =
      -clothWidth * rootLayout.scale * 0.18 - swayY * 0.35;
    contactShadow.rotation.x = swayX * 0.1;
    contactShadow.rotation.y = swayY * 0.04;
    contactShadow.rotation.z = swayY * -0.03;
    contactShadow.scale.x = clothWidth * rootLayout.scale * (0.42 - lift * 0.04);
    contactShadow.scale.y = clothHeight * rootLayout.scale * (0.92 - lift * 0.08);
    contactShadow.material.opacity = 0.16 + (0.04 - lift * 0.03);

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
