var camera, scene, renderer, controls;
var geometry, material, cube1, cube2, cube3, plane, sphere;

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

var projector;
var mouse = { x: 0, y: 0 };
var INTERSECTED;
var textureLoader = new THREE.TextureLoader();
var originalTextureCube1;
var originalTextureCube2;
var originalTextureCube3;

init();
render();

function init() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  addObjects();

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  projector = new THREE.Projector();
  document.addEventListener("mousemove", onDocumentMouseMove, false);
}

function render() {
  requestAnimationFrame(render);

  cube3.rotation.y += 0.02;

  sphere.rotation.y += 0.0003;

  renderer.render(scene, camera);
  camera.lookAt(scene.position);

  update();
}

function addObjects() {
  var geometryPlane = new THREE.PlaneGeometry(10, 10, 4, 4);
  var materialPlane = new THREE.MeshBasicMaterial({
    color: 0x747570,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(0, -0.5, 0);
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  var geometryCube = new THREE.BoxGeometry(1, 1, 1);
  originalTextureCube1 = textureLoader.load("texture/box.jpg");
  var materialCube = new THREE.MeshBasicMaterial({ map: originalTextureCube1 });
  cube1 = new THREE.Mesh(geometryCube, materialCube);
  cube1.position.set(0, 0, 0);
  scene.add(cube1);

  var geometryOpacityBox = new THREE.BoxGeometry(1, 1, 1);
  var originalTextureCube2 = new THREE.MeshBasicMaterial({
    color: 0xeaf913,
    transparent: true,
    opacity: 0.5,
  });
  cube2 = new THREE.Mesh(geometryOpacityBox, originalTextureCube2);
  cube2.position.set(1.5, 0, 0);
  scene.add(cube2);

  var geometryWiredBox = new THREE.BoxGeometry(1, 1, 1);
  var originalTextureCube3 = new THREE.MeshBasicMaterial({
    color: "rgb(255,0,0)",
    wireframe: true,
    transparent: true,
  });
  cube3 = new THREE.Mesh(geometryWiredBox, originalTextureCube3);
  cube3.position.set(-1.5, 0, 0);
  scene.add(cube3);

  var geometrySphere = new THREE.SphereGeometry(100, 100, 100);
  var SphereTexture = new THREE.ImageUtils.loadTexture("texture/sky.jpg");
  var materialSphere = new THREE.MeshBasicMaterial({
    map: SphereTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  sphere = new THREE.Mesh(geometrySphere, materialSphere);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);
}

function update() {
  var delta = clock.getDelta(); // seconds.
  var moveDistance = 2 * delta;
  var rotateAngle = (Math.PI / 2) * delta;

  // move forwards/backwards/left/right
  if (keyboard.pressed("W")) cube1.translateZ(-moveDistance);
  if (keyboard.pressed("S")) cube1.translateZ(moveDistance);
  if (keyboard.pressed("Q")) cube1.translateX(-moveDistance);
  if (keyboard.pressed("E")) cube1.translateX(moveDistance);

  // global coordinates
  if (keyboard.pressed("left")) cube1.position.x -= moveDistance;
  if (keyboard.pressed("right")) cube1.position.x += moveDistance;
  if (keyboard.pressed("up")) cube1.position.z -= moveDistance;
  if (keyboard.pressed("down")) cube1.position.z += moveDistance;

  controls.update();

  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  projector.unprojectVector(vector, camera);
  var ray = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );
  var intersects = ray.intersectObjects(scene.children);

  //sleduje sa intersekcia kurzora s okolitymi objektmi
  if (intersects.length > 0) {
    //ak je object detegovany, zafarbi sa na zeleno, ostatne objekty maju povodnu farbu
    if (intersects[0].object != INTERSECTED) {
      if (INTERSECTED == cube1) {
        INTERSECTED.material.map = originalTextureCube1;
        INTERSECTED.material.needsUpdate = true;
      }
      if (INTERSECTED == cube2) {
        INTERSECTED.scale.x = 1;
        INTERSECTED.material.map = originalTextureCube2;
        INTERSECTED.material.needsUpdate = true;
      }
      if (INTERSECTED == cube3) {
        INTERSECTED.position.y -= 0.5;
        INTERSECTED.material.map = originalTextureCube3;
        INTERSECTED.material.wireframe = true;
        console.log(originalTextureCube3);
        INTERSECTED.material.needsUpdate = true;
      }
      if (INTERSECTED)
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      INTERSECTED = intersects[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      //   INTERSECTED.material.color.setHex(0x0000ff);
      if (INTERSECTED == cube1) {
        // INTERSECTED.material.color.setHex(0x000000);
        INTERSECTED.material.map = textureLoader.load("texture/lirkis.jpg");
        INTERSECTED.material.needsUpdate = true;
      }
      if (INTERSECTED == cube2) {
        INTERSECTED.material.map = textureLoader.load("texture/lirkis.jpg");
        INTERSECTED.material.wireframe = false;
        INTERSECTED.material.needsUpdate = true;
        INTERSECTED.scale.x = 0.5;
      }
      if (INTERSECTED == cube3) {
        INTERSECTED.material = new THREE.MeshBasicMaterial({
          map: textureLoader.load("texture/lirkis.jpg"),
        });
        INTERSECTED.material.needsUpdate = true;
        INTERSECTED.position.y += 0.5;
      }
    }
  } else {
    //po ukonceni intersekcie sa objektu priradi povodna farba
    if (INTERSECTED) {
      //   INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      if (INTERSECTED == cube1) {
      }
    }
    INTERSECTED = null;
  }
}

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
