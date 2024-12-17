var camera, scene, renderer, controls; // Added 'controls'
var plane, ball1, ball2, background;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

// Gravity and physics variables for the ball simulation
var gravity = -20;
var timeStep = 0.05;

// Ball-specific properties
var ballData = [
  { velocity: 0, positionY: 20, object: null, gravity: -20 },
  { velocity: 0, positionY: 30, object: null, gravity: -50 },
];

// Drag-and-drop variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var isDragging = false;
var draggableObject = null;

init();
render();

function init() {
  // Camera Setup
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 50, 100);
  camera.lookAt(0, 0, 0);

  // Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false; // Disable all shadows
  document.body.appendChild(renderer.domElement);

  // Scene Setup
  scene = new THREE.Scene();

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  // Add objects
  addObjects();

  // Event Listeners
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mouseup", onMouseUp, false);
}

function render() {
  requestAnimationFrame(render);

  // Update OrbitControls
  update();

  // Simulate free-fall for the spheres if not dragging
  if (!isDragging) {
    ballSimulation();
  }

  renderer.render(scene, camera);

  if (keyboard.pressed("R")) {
    ballData[0].positionY = 20;
    ball1.position.x = 0;
    ballData[1].positionY = 30;
    ball2.position.x = 10;
  }
}

function addObjects() {
  // Ambient Light
  var light = new THREE.AmbientLight(0x404040, 1);
  scene.add(light);

  // Plane (Ground)
  var geometryPlane = new THREE.PlaneGeometry(700, 700, 4, 4);
  var planeTexture = new THREE.TextureLoader().load("texture/brick_floor.jpg");
  var materialPlane = new THREE.MeshBasicMaterial({
    map: planeTexture,
    side: THREE.DoubleSide,
  });

  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(0, -5, 0);
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  // Ball 1
  ball1 = createBall(0, ballData[0].positionY, 0, "texture/wood.png");
  ballData[0].object = ball1;

  // Ball 2
  ball2 = createBall(10, ballData[1].positionY, 0, "texture/carbon.png");
  ballData[1].object = ball2;

  // Sky Sphere (Background)
  var geometryBackground = new THREE.SphereGeometry(700, 32, 32);
  var backgroundTexture = new THREE.TextureLoader().load("texture/sky.jpg");
  var materialBackground = new THREE.MeshBasicMaterial({
    map: backgroundTexture,
    side: THREE.DoubleSide,
  });
  background = new THREE.Mesh(geometryBackground, materialBackground);
  background.position.set(0, 0, 0);
  scene.add(background);
}

function createBall(x, y, z, texturePath) {
  var geometryBall = new THREE.SphereGeometry(5, 32, 32);
  var ballTexture = new THREE.TextureLoader().load(texturePath);
  var materialBall = new THREE.MeshBasicMaterial({
    map: ballTexture,
  });
  var ball = new THREE.Mesh(geometryBall, materialBall);
  ball.position.set(x, y, z);
  scene.add(ball);
  return ball;
}

function ballSimulation() {
  ballData.forEach((ball) => {
    if (!isDragging || draggableObject !== ball.object) {
      ball.velocity += ball.gravity * timeStep;
      ball.positionY += ball.velocity * timeStep;

      if (ball.positionY <= 0) {
        ball.positionY = 0;
        ball.velocity = -ball.velocity * 0.5;
      }

      ball.object.position.y = ball.positionY;
    }
  });
}

let hasDragged = false; // Track dragging state

// Track current Z position for each ball
var ballZPositions = {
  ball1: ball1.position.z,
  ball2: ball2.position.z,
};

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects([ball1, ball2]);

  if (intersects.length > 0) {
    isDragging = true;
    hasDragged = false; // Reset dragging state
    draggableObject = intersects[0].object;

    // Stop OrbitControls while dragging
    controls.enabled = false;

    // Stop gravity for the selected ball
    ballData.forEach((ball) => {
      if (ball.object === draggableObject) ball.velocity = 0;
    });
  }
}

function onMouseMove(event) {
  if (isDragging && draggableObject) {
    hasDragged = true; // Mark as dragging
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.setFromCamera(mouse, camera);

    var intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);

    if (intersection) {
      const groundLevel = -5 + 5; // Plane Y (-5) + Ball radius (5)
      const newY = Math.max(intersection.y, groundLevel);

      // Set new position, but maintain the Z position from ballZPositions
      draggableObject.position.set(
        intersection.x,
        newY,
        ballZPositions[draggableObject === ball1 ? "ball1" : "ball2"]
      );

      // Update ball's Y position
      ballData.forEach((ball) => {
        if (ball.object === draggableObject) ball.positionY = newY;
      });
    }
  }
}

function onMouseUp(event) {
  if (isDragging) {
    isDragging = false;
    draggableObject = null;

    // Only re-enable OrbitControls if no dragging occurred
    setTimeout(() => {
      if (!hasDragged) {
        controls.enabled = true;
      }
    }, 50); // Delay to prevent immediate triggering
  } else {
    controls.enabled = true; // Enable controls if it was a simple click
  }
}

function update() {
  var delta = clock.getDelta();
  var moveDistance = 30 * delta;
  var rotateAngle = (Math.PI / 2) * delta;

  if (keyboard.pressed("W")) {
    ball1.translateZ(moveDistance);
    ballZPositions.ball1 = ball1.position.z; // Update Z position
  }

  if (keyboard.pressed("S")) {
    ball1.translateZ(-moveDistance);
    ballZPositions.ball1 = ball1.position.z; // Update Z position
  }

  controls.update();
}
