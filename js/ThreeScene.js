var camera, scene, renderer, controls;
var geometry, material, cube1, cube2, cube3, cube4, plane, sphere;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

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
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  camera.lookAt(scene.position);
  //     cube1.add(cube3);
  //     cube3.add(cube2); //cube2 bude potomkom cube3
  //     cube3.add(cube4);
  cube1.rotation.z -= 0.02;
  //     cube2.position.set(0, 1.5, 20); //nastaví sa pozícia cube2 od cube3
  cube2.rotation.z -= 0.02; //rotovanie len cube2
  //     cube3.position.set(0.0, 3.0, 0);
  //     cube3.rotation.x -= 0.02;
  cube3.rotation.z -= 0.02; //rotovaním cube3 sa automaticky rotuje aj cube2
  //     cube3.rotation.z -= 0.02;
  cube4.rotation.z -= 0.02;
  //   sphere.rotation.x += 0.1;
  sphere.rotation.z += 0.0025;
  //   sphere.rotation.z += 0.1;
  update();
}

function addObjects() {
  //   var geometryPlane = new THREE.PlaneGeometry(50, 50, 10, 10);
  //   var materialPlane = new THREE.MeshBasicMaterial({
  //     color: 0x747570,
  //     side: THREE.DoubleSide,
  //   });
  //   plane = new THREE.Mesh(geometryPlane, materialPlane);
  //   plane.position.set(0, -5, 0);
  //   plane.rotation.x = Math.PI / 2;
  //   scene.add(plane);

  //kocka 1
  var geometryCube = new THREE.SphereGeometry(10, 10, 10);
  var cubeTexture = new THREE.ImageUtils.loadTexture("texture/copper1.png");
  var materialCube = new THREE.MeshBasicMaterial({
    map: cubeTexture,
  });
  cube1 = new THREE.Mesh(geometryCube, materialCube);
  cube1.position.set(25, -20, 20);
  scene.add(cube1);

  //kocka 2
  var geometryOpacityBox = new THREE.SphereGeometry(10, 10, 10);
  var gula2Textura = new THREE.ImageUtils.loadTexture("texture/copper2.png");
  var materialOpacityBox = new THREE.MeshBasicMaterial({
    map: gula2Textura,
  });
  cube2 = new THREE.Mesh(geometryOpacityBox, materialOpacityBox);
  cube2.position.set(-25, -20, 20);
  scene.add(cube2);

  //kocka 3
  var geometryWoodenBall = new THREE.SphereGeometry(10, 10, 10);
  var woodenBallTexture = new THREE.ImageUtils.loadTexture(
    "texture/copper2.png"
  );

  var materialWoodenBall = new THREE.MeshBasicMaterial({
    map: woodenBallTexture,
  });
  cube3 = new THREE.Mesh(geometryWoodenBall, materialWoodenBall);
  cube3.position.set(25, -20, -20);
  scene.add(cube3);

  //kocka 4
  var geometryCube = new THREE.SphereGeometry(10, 10, 10);
  var cubeTexture = new THREE.ImageUtils.loadTexture("texture/copper1.png");
  var materialCube = new THREE.MeshBasicMaterial({
    map: cubeTexture,
  });
  cube4 = new THREE.Mesh(geometryCube, materialCube);
  cube4.position.set(-25, -20, -20);
  scene.add(cube4);

  //karoseria
  var geometryAuto = new THREE.BoxGeometry(80, 40, 40);
  var autoTexture = new THREE.ImageUtils.loadTexture("texture/copper4.png");
  var materialAuto = new THREE.MeshBasicMaterial({
    map: autoTexture,
  });
  auto = new THREE.Mesh(geometryAuto, materialAuto);
  auto.position.set(0, 0, 0);
  scene.add(auto);

  //primitiv gule
  var geometrySphere = new THREE.SphereGeometry(200, 200, 200);
  var cubeTexture = new THREE.ImageUtils.loadTexture("texture/sky.jpg");
  var materialSphere = new THREE.MeshBasicMaterial({
    map: cubeTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  sphere = new THREE.Mesh(geometrySphere, materialSphere);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);
}

function update() {
  var delta = clock.getDelta();
  var moveDistance = 2 * delta;
  var rotateAngle = (Math.PI / 2) * delta;

  if (keyboard.pressed("W")) cube1.translateZ(-moveDistance);
  if (keyboard.pressed("S")) cube1.translateZ(moveDistance);
  if (keyboard.pressed("Q")) cube1.translateX(-moveDistance);
  if (keyboard.pressed("E")) cube1.translateX(moveDistance);
  if (keyboard.pressed("up")) cube1.position.z -= moveDistance;
  if (keyboard.pressed("down")) cube1.position.z += moveDistance;
  if (keyboard.pressed("left")) cube1.position.x -= moveDistance;
  if (keyboard.pressed("right")) cube1.position.x += moveDistance;
  controls.update();
}
