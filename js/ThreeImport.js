var camera, scene, renderer, controls;
var geometry, material, cube, cylinder, sphere;

var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

var objcar;

var curve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-5, 1, 5),
    new THREE.Vector3(5, 1, 5),
    new THREE.Vector3(5, 1, -5),
    new THREE.Vector3(-5, 1, -5),
  ],
  true
);
var points = curve.getPoints(50);
var geometry = new THREE.BufferGeometry().setFromPoints(points);
var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
var curveObject = new THREE.Line(geometry, material);
var PosIndex = 0;

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
  addLights();

  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
  camera.lookAt(scene.position);
  update();
  renderer.shadowMap.enabled = true;

  scene.add(curveObject);

  PosIndex++;
  if (PosIndex > 10000) {
    PosIndex = 0;
  }
  var camPos = curve.getPoint(PosIndex / 1000);
  var camRot = curve.getTangent(PosIndex / 1000);
  cube.position.x = camPos.x;
  cube.position.y = camPos.y;
  cube.position.z = camPos.z;
  cube.rotation.x = camRot.x;
  cube.rotation.y = camRot.y;
  cube.rotation.z = camRot.z;
  cube.lookAt(curve.getPoint((PosIndex + 1) / 1000));

  //Pridanie fragmentu pre animovanie krivky
}

function addObjects() {
  var floorTexture = new THREE.ImageUtils.loadTexture("texture/floor.jpg");
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  var geometryPlane = new THREE.PlaneGeometry(20, 20, 4, 4);
  var materialPlane = new THREE.MeshStandardMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
    roughness: 0.12,
    metalness: 0.45,
  });
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(0, -0.5, 0);
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  var geometrySphere = new THREE.SphereGeometry(100, 100, 100);
  var sphereTexture = new THREE.ImageUtils.loadTexture("texture/room.jpg");
  var materialSphere = new THREE.MeshBasicMaterial({
    map: sphereTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  sphere = new THREE.Mesh(geometrySphere, materialSphere);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);

  loadOBJectsStandard(
    2,
    -0.5,
    0,
    "models/car/Pony_cartoon.obj",
    0.003,
    0.003,
    0.003,
    "models/car/Body_dDo_d_orange.jpg",
    "white"
  );

  loadOBJectsPhong(
    -2,
    -0.5,
    0,
    "models/car/Pony_cartoon.obj",
    0.003,
    0.003,
    0.003,
    "models/car/Body_dDo_d_orange.jpg",
    "white"
  );

  loadObjWithMTL(
    "models/lirkis_car/lirkis_car.obj",
    "models/lirkis_car/lirkis_car.mtl",
    0.5,
    0.5,
    0.5,
    0,
    -0.2,
    0
  );

  var geometryCube = new THREE.BoxGeometry(1, 1, 1);
  var cubeTexture = new THREE.ImageUtils.loadTexture("texture/lirkis.jpg");
  var materialCube = new THREE.MeshBasicMaterial({
    map: cubeTexture,
    side: THREE.DoubleSide,
  });
  cube = new THREE.Mesh(geometryCube, materialCube);
  cube.position.set(0, 0, 0);
  scene.add(cube);

  //Pridanie fragmentu pre objekt kocky

  //Pridanie fragmentu pre nacitanie modelov
}

function addLights() {
  var ambientLight = new THREE.AmbientLight(0x7f7f7f);
  scene.add(ambientLight);

  var spotlight = new THREE.SpotLight("rgb(255,255,255)");
  spotlight.angle = Math.PI / 1;
  spotlight.position.set(0, 4, 2);
  spotlight.intensity = 2;
  spotlight.castShadow = true;
  scene.add(spotlight);
  spotlight.penumbra = 1;
  var spotLightHelper = new THREE.SpotLightHelper(spotlight);
  scene.add(spotLightHelper);
}

function update() {
  controls.update();
}

function loadOBJectsStandard(
  x,
  y,
  z,
  path,
  scalex,
  scaley,
  scalez,
  texturePath,
  colorMaterial
) {
  var loader = new THREE.OBJLoader();
  var textureSurface = new THREE.TextureLoader().load(texturePath);
  var material = new THREE.MeshStandardMaterial({
    color: colorMaterial,
    map: textureSurface,
    roughness: 0.05,
    metalness: 0.45,
  });
  loader.load(path, function (object) {
    object.traverse(function (node) {
      object.position.set(x, y, z);
      object.material = material;
      object.scale.set(scalex, scaley, scalez);
      if (node.isMesh) node.material = material;
    });
    scene.add(object);
  });
}

function loadOBJectsPhong(
  x,
  y,
  z,
  path,
  scalex,
  scaley,
  scalez,
  texturePath,
  colorMaterial
) {
  var loader = new THREE.OBJLoader();
  var textureSurface = new THREE.TextureLoader().load(texturePath);
  var material = new THREE.MeshPhongMaterial({
    color: colorMaterial,
    map: textureSurface,
  });
  loader.load(path, function (object) {
    object.traverse(function (node) {
      object.position.set(x, y, z);
      object.material = material;
      object.scale.set(scalex, scaley, scalez);
      if (node.isMesh) node.material = material;
    });
    scene.add(object);
  });
}

function loadObjWithMTL(
  objPath,
  MTLpath,
  scalex,
  scaley,
  scalez,
  posX,
  posY,
  posZ
) {
  // ak nie je potrebná globálna premenná tu definujte objekt objcar;
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load(MTLpath, function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(objPath, function (object) {
      objcar = object;
      objcar.position.set(posX, posY, posZ);
      objcar.scale.set(scalex, scaley, scalez);
      scene.add(objcar);
    });
  });
}
