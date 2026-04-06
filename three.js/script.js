(function () {
  /*
    GUIA RAPIDA PARA CLASE
    ----------------------
    Este archivo hace cuatro cosas:

    1. Encuentra un contenedor del DOM donde inyectar un canvas.
    2. Crea una escena de Three.js con camara, luces y una malla plana.
    3. Aplica image.png como textura sobre esa malla.
    4. Deforma los vertices en cada frame para simular una tela ondeando.

    Como llevar este efecto a otro proyecto:
    - Copiar el contenedor HTML con [data-flag-stage].
    - Copiar styles.css o al menos el tamano del contenedor.
    - Copiar three.min.js, image.png y este script.
    - Ajustar clothWidth, clothHeight y la posicion de la camara segun el
      formato de la imagen que se quiera usar.

    Idea clave para los alumnos:
    no estamos "animando una imagen". Estamos animando una malla 3D que lleva
    una imagen pegada encima como textura.
  */
  var stage = document.querySelector("[data-flag-stage]");

  /*
    Salida temprana: si no existe el contenedor, no tiene sentido continuar.
    Esto hace que el script sea seguro incluso si se carga en otra pagina.
  */
  if (!stage) {
    return;
  }

  /*
    Three.js se expone como window.THREE porque se carga como script clasico.
    Si no existe, avisamos con un error explicito.
  */
  if (!window.THREE) {
    console.error("Three.js no esta disponible en esta demo.");
    return;
  }

  /*
    Si la pagina se abre desde file:// el navegador suele bloquear texturas
    externas en WebGL. Por eso detectamos ese caso y usamos una textura
    embebida en base64.

    En un proyecto normal servido por localhost o por un servidor real,
    image.png se puede cargar directamente.
  */
  var needsEmbeddedTexture = window.location.protocol === "file:";

  if (needsEmbeddedTexture && !window.FLAG_TEXTURE_DATA) {
    console.error("La textura embebida de la bandera no esta disponible.");
    return;
  }

  var THREE = window.THREE;

  /*
    El renderer es el motor que dibuja la escena en el canvas.
    - antialias suaviza bordes.
    - alpha permite que el fondo CSS se vea detras.
    - powerPreference intenta pedir una GPU rapida cuando es posible.
  */
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  /*
    Ajustes basicos de calidad:
    - pixelRatio limitado a 2 para no disparar el coste en pantallas retina.
    - sRGBEncoding para que la textura se vea con colores correctos.
  */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  stage.appendChild(renderer.domElement);

  /*
    Escena y camara:
    - Scene es el contenedor de todo lo 3D.
    - PerspectiveCamera da profundidad real y hace que la bandera no se sienta
      como una simple capa 2D.
  */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(24, 1, 0.1, 60);
  camera.position.set(0.45, 0.1, 11.6);

  /*
    Luces:
    - AmbientLight evita sombras totalmente negras.
    - DirectionalLight principal da volumen a los pliegues.
    - Otra direccional azulada ayuda a integrar la bandera con el fondo.
    - PointLight inferior rellena un poco la parte baja.

    En clase conviene explicar que sin luces una textura sobre una malla sigue
    pareciendo plana, aunque la malla se deforme.
  */
  var ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  var keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 3.5, 7.5);
  scene.add(keyLight);

  var coolLight = new THREE.DirectionalLight(0xa8d4ff, 1.05);
  coolLight.position.set(-5.5, 2.2, 3.2);
  scene.add(coolLight);

  var lowerFill = new THREE.PointLight(0xbfdcff, 0.55, 30);
  lowerFill.position.set(1.2, -2.2, 5);
  scene.add(lowerFill);

  /*
    root agrupa toda la bandera.
    Esto permite mover, rotar o desplazar todo el conjunto sin recalcular cada
    pieza por separado. Es una tecnica muy util para organizar escenas.
  */
  var root = new THREE.Group();
  scene.add(root);

  /*
    rootLayout guarda la colocacion "base" decidida por resize().
    animate() trabaja a partir de estos valores para anadir una oscilacion
    suave sin perder el encuadre responsive.
  */
  var rootLayout = {
    x: 0,
    y: 0,
    scale: 1,
  };

  /*
    Parametros de la tela:
    - clothWidth / clothHeight marcan el tamano de la malla.
    - widthSegments / heightSegments controlan cuantas divisiones tiene.

    Regla didactica importante:
    una bandera no puede deformarse bien si el plano tiene pocos segmentos.
    Cuantos mas vertices tenga, mas suave sera la onda. El coste es que la
    animacion requiere mas calculo por frame.
  */
  var clothWidth = 9.6;
  var clothHeight = 5.55;
  var widthSegments = 132;
  var heightSegments = 78;
  var clothGeometry = new THREE.PlaneGeometry(
    clothWidth,
    clothHeight,
    widthSegments,
    heightSegments
  );

  /*
    PlaneGeometry nace centrada.
    La trasladamos media anchura a la derecha para que el borde izquierdo quede
    en x = 0. Asi es mas facil "anclar" ese lado como si estuviera sujeto a un
    mastil invisible.
  */
  clothGeometry.translate(clothWidth * 0.5, 0, 0);

  /*
    La textura puede venir de dos sitios:
    - image.png si la demo vive en HTTP.
    - FLAG_TEXTURE_DATA si estamos abriendo el archivo directamente.
  */
  var textureSource = needsEmbeddedTexture ? window.FLAG_TEXTURE_DATA : "./image.png";
  var texture = new THREE.TextureLoader().load(textureSource);

  /*
    anisotropy mejora la lectura de la imagen cuando la malla se inclina.
    Los wrap ClampToEdge evitan repeticion en los bordes.
  */
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.encoding = THREE.sRGBEncoding;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  /*
    MeshStandardMaterial responde a la luz, por eso se ven los pliegues.
    DoubleSide evita que la bandera desaparezca cuando gira y se enseña la cara
    trasera.
  */
  var clothMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    roughness: 0.88,
    metalness: 0.01,
  });

  var clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
  root.add(clothMesh);

  /*
    La sombra se resuelve con una tecnica hibrida:
    - no usamos shadow maps reales porque no hay un "suelo" 3D receptor
    - en su lugar creamos sombras blandas con textura degradada

    Esto permite una sombra mas realista que un simple plano oscuro:
    - tiene centro mas denso y bordes difusos
    - el cuerpo general de la bandera proyecta una sombra ancha
    - la zona de contacto anade una sombra mas concentrada y cercana

    La sombra vive fuera de root para que podamos decidir manualmente que
    transformaciones copia y cuales no.

    En esta version SI hereda toda la rotacion del paño, pero sigue separada
    como grupo propio para conservar el control sobre su escala, su opacidad y
    sus dos capas blandas.
  */
  var shadowGroup = new THREE.Group();
  scene.add(shadowGroup);

  function createShadowTexture(config) {
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    var ctx = canvas.getContext("2d");
    var radial = ctx.createRadialGradient(
      canvas.width * config.innerX,
      canvas.height * config.innerY,
      canvas.height * config.innerRadius,
      canvas.width * config.outerX,
      canvas.height * config.outerY,
      canvas.width * config.outerRadius
    );

    radial.addColorStop(0, "rgba(26, 43, 71," + config.centerAlpha + ")");
    radial.addColorStop(0.45, "rgba(30, 49, 79," + config.midAlpha + ")");
    radial.addColorStop(1, "rgba(30, 49, 79,0)");

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  var broadShadowTexture = createShadowTexture({
    innerX: 0.4,
    innerY: 0.5,
    innerRadius: 0.06,
    outerX: 0.48,
    outerY: 0.5,
    outerRadius: 0.5,
    centerAlpha: 0.9,
    midAlpha: 0.32,
  });

  var contactShadowTexture = createShadowTexture({
    innerX: 0.22,
    innerY: 0.5,
    innerRadius: 0.04,
    outerX: 0.26,
    outerY: 0.5,
    outerRadius: 0.28,
    centerAlpha: 0.88,
    midAlpha: 0.26,
  });

  var broadShadow = new THREE.Mesh(
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

  var contactShadow = new THREE.Mesh(
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
    Guardamos dos referencias esenciales:
    - positions: array vivo que Three.js usa para dibujar la geometria.
    - basePositions: copia del estado inicial, necesaria para no deformar
      sobre una deformacion ya aplicada en el frame anterior.

    Este detalle es importante para clase: si no conservamos la version base,
    la malla se iria "rompiendo" poco a poco acumulando offsets.
  */
  var positionAttribute = clothGeometry.attributes.position;
  var positions = positionAttribute.array;
  var basePositions = positions.slice();
  var clock = new THREE.Clock();

  /*
    smoothstep crea una transicion suave entre 0 y 1.
    Aqui se usa para que el borde cercano al mastil apenas se suelte y la tela
    gane libertad de movimiento segun avanza hacia la punta.
  */
  function smoothstep(edge0, edge1, value) {
    var x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return x * x * (3 - 2 * x);
  }

  /*
    Calcula cuanta anchura y altura "ve" una camara en perspectiva a una
    profundidad concreta. Esto nos permite adaptar la bandera al viewport real
    sin probar valores a ojo.
  */
  function getVisibleSizeAtDepth(depth) {
    var distance = Math.abs(camera.position.z - depth);
    var visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;

    return {
      width: visibleHeight * camera.aspect,
      height: visibleHeight,
    };
  }

  /*
    resize sincroniza el renderer con el tamano real del contenedor.
    Es el puente entre CSS y WebGL.

    Ademas, aqui hacemos el ajuste responsive de la bandera:
    - medimos el viewport real del canvas
    - calculamos el espacio visible de la camara
    - escalamos la malla para que cubra el viewport sin deformar la imagen

    El factor 1.06 deja un pequeno margen extra para que la rotacion y la
    ondulacion no dejen "huecos" en los bordes.
  */
  function resize() {
    var width = stage.clientWidth;
    var height = stage.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    var visibleSize = getVisibleSizeAtDepth(root.position.z);
    var coverScale =
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

    Recorremos todos los vertices de la malla y calculamos un nuevo offset
    para cada uno. La bandera funciona porque no hay una sola onda:
    combinamos varias capas de movimiento con roles distintos.

    Variables mas importantes:
    - normalizedX: posicion horizontal de 0 a 1.
    - normalizedY: altura relativa del vertice.
    - leftRelease: cuanto se libera la tela desde el borde izquierdo.
    - rightRelease: reduce la deformacion justo antes del borde derecho.
    - verticalRelease: mantiene mas rigidos el borde superior e inferior.
    - interior: zona realmente flexible de la tela.
    - tail: concentra la energia visual en la mitad derecha sin dejar que
      el borde final se deforme demasiado.

    Ondas usadas:
    - bellyWave: pliegue principal y lento, da el volumen grande.
    - secondaryWave: rompe la uniformidad.
    - flutterWave: vibracion rapida de tela.
    - gustWave: variacion de viento mas amplia y lenta.
    - chaosWave: irregularidad intermedia para evitar un patron demasiado limpio.
    - microRipple: ruido fino en la superficie.
    - gustPulse: pulsos de viento que hacen variar la energia del movimiento.
    - twistWave: torsion ligera entre parte alta y baja.
    - tipFlick: latigazo final en la punta libre.

    Los offsets resultantes se reparten en:
    - x: pequenas compresiones/estiramientos horizontales.
    - y: caida y vibracion vertical.
    - z: profundidad, que es lo que realmente hace "salir" la tela hacia
      delante y hacia atras.
  */
  function deformFlag(time) {
    for (var i = 0; i < positions.length; i += 3) {
      var baseX = basePositions[i];
      var baseY = basePositions[i + 1];
      var normalizedX = baseX / clothWidth;
      var normalizedY = baseY / (clothHeight * 0.5);
      var distanceToHorizontalEdge = 1 - Math.abs(normalizedY);

      /*
        Bordes rigidos:
        - el izquierdo se comporta como un anclaje
        - el derecho conserva algo de vida, pero sin doblarse en exceso
        - arriba y abajo se amortiguan para que la silueta se lea mas firme
      */
      var leftRelease = smoothstep(0.06, 0.22, normalizedX);
      var rightRelease = smoothstep(0.0, 0.12, 1 - normalizedX);
      var verticalRelease = smoothstep(0.02, 0.22, distanceToHorizontalEdge);
      var interior = leftRelease * verticalRelease * (0.35 + rightRelease * 0.65);
      var tail = Math.pow(normalizedX, 1.18) * (0.45 + rightRelease * 0.55);
      var tipZone = smoothstep(0.58, 0.92, normalizedX) * verticalRelease * rightRelease;

      var bellyWave = Math.sin(baseX * 1.18 - time * 1.85);
      var secondaryWave = Math.sin(baseX * 2.95 - time * 3.75 + baseY * 1.15);
      var flutterWave = Math.sin(baseX * 6.4 - time * 7.1 + baseY * 5.2);
      var chaosWave =
        Math.sin(baseX * 4.2 - time * 2.45 + baseY * 2.7) *
        Math.cos(baseX * 1.25 + time * 1.1 - baseY * 1.4);
      var microRipple =
        Math.sin(baseX * 12.8 - time * 11.4 + baseY * 9.6) *
        Math.cos(baseX * 7.5 + time * 8.2 - baseY * 4.4);
      var gustWave =
        Math.sin(time * 0.62) * 0.52 +
        Math.sin(time * 1.26 + baseX * 0.22) * 0.2;
      var gustPulse =
        0.72 +
        (Math.sin(time * 0.33 + baseX * 0.09) * 0.18 +
          Math.sin(time * 0.91 - baseY * 0.45) * 0.1);
      var twistWave = Math.sin(time * 1.08 + baseX * 0.56 - baseY * 1.7);
      var tipFlick = Math.sin(time * 6.2 - baseY * 3.4) * Math.pow(normalizedX, 3.25);

      var zOffset =
        (bellyWave * 0.48 +
          secondaryWave * 0.14 +
          flutterWave * 0.035 +
          chaosWave * 0.1 +
          microRipple * 0.018 +
          gustWave * 0.2) *
          interior *
          gustPulse +
        tipFlick * 0.15 * tipZone * gustPulse;

      var yOffset =
        (secondaryWave * 0.065 +
          flutterWave * 0.026 +
          chaosWave * 0.032 +
          microRipple * 0.008) *
          interior *
          gustPulse -
        tail * 0.18 +
        Math.sin(time * 0.92 + normalizedX * 2.4) * 0.06 * distanceToHorizontalEdge * interior +
        twistWave * 0.028 * tail;

      var xOffset =
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
      Avisamos a Three.js de que la geometria ha cambiado y recalculamos las
      normales para que la luz siga reaccionando correctamente a los nuevos
      pliegues.
    */
    positionAttribute.needsUpdate = true;
    clothGeometry.computeVertexNormals();
  }

  /*
    animate ejecuta el bucle de render:
    1. mide el tiempo
    2. deforma la tela
    3. mueve ligeramente el grupo completo
    4. renderiza
    5. pide el siguiente frame

    La pequena oscilacion de root evita que todo el movimiento recaiga solo en
    los vertices. Eso hace que la bandera respire mejor y se sienta menos
    "matematica".
  */
  function animate() {
    var elapsed = clock.getElapsedTime();

    deformFlag(elapsed);

    root.rotation.y = -0.24 + Math.sin(elapsed * 0.24) * 0.04;
    root.rotation.x = -0.025 + Math.sin(elapsed * 0.18) * 0.01;
    root.scale.setScalar(rootLayout.scale);
    root.position.x = rootLayout.x;
    root.position.y = rootLayout.y + Math.sin(elapsed * 0.48) * 0.03 * rootLayout.scale;

    /*
      La sombra sigue a la bandera y ahora copia toda su rotacion.
      Mantenemos el grupo separado para poder seguir ajustando:
      - desplazamiento general
      - escala de cada capa
      - opacidad de la sombra principal y la de contacto
    */
    var swayY = root.rotation.y;
    var swayX = root.rotation.x;
    var lift = Math.abs(swayY) * 0.9 + Math.abs(swayX) * 1.6;

    shadowGroup.position.x = root.position.x + clothWidth * rootLayout.scale * 0.54 - swayY * 1.55;
    shadowGroup.position.y = root.position.y - clothHeight * rootLayout.scale * 0.05 - lift * 0.16;
    shadowGroup.rotation.x = root.rotation.x;
    shadowGroup.rotation.y = root.rotation.y;
    shadowGroup.rotation.z = root.rotation.z;

    /*
      Las capas internas recuperan una rotacion parcial adicional.
      Asi la sombra mantiene la rotacion completa del paño a nivel de grupo,
      pero cada capa puede "acomodarse" un poco para ganar riqueza visual.
    */
    broadShadow.rotation.x = swayX * 0.18;
    broadShadow.rotation.y = swayY * 0.08;
    broadShadow.rotation.z = swayY * -0.06;
    broadShadow.scale.x =
      clothWidth * rootLayout.scale * (0.95 + lift * 0.09 + Math.sin(elapsed * 0.38) * 0.01);
    broadShadow.scale.y =
      clothHeight * rootLayout.scale * (0.74 - lift * 0.05 + Math.cos(elapsed * 0.27) * 0.008);
    broadShadow.material.opacity = 0.22 - lift * 0.05;

    contactShadow.position.x = -clothWidth * rootLayout.scale * 0.18 - swayY * 0.35;
    contactShadow.rotation.x = swayX * 0.1;
    contactShadow.rotation.y = swayY * 0.04;
    contactShadow.rotation.z = swayY * -0.03;
    contactShadow.scale.x = clothWidth * rootLayout.scale * (0.42 - lift * 0.04);
    contactShadow.scale.y = clothHeight * rootLayout.scale * (0.92 - lift * 0.08);
    contactShadow.material.opacity = 0.16 + (0.04 - lift * 0.03);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  /*
    Arranque inicial:
    primero adaptamos medidas y luego comenzamos el loop.
  */
  resize();
  animate();

  /*
    ResizeObserver es la mejor opcion cuando el contenedor puede cambiar de
    tamano por CSS o por layout. Si no existe, caemos al resize clasico de
    window.
  */
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener("resize", resize);
  }
})();
