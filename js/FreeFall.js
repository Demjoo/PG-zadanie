var camera, scene, renderer, controls; // Added 'controls'
var plane, tennisBall, ball2, Basketball, background;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

// Gravity and physics variables for the ball simulation
var gravity = -20;
var timeStep = 0.05;

// Ball-specific properties
var ballData = [
  {
    velocity: 0,
    positionY: 20,
    object: null,
    gravity: -20,
    bounce: 0.7,
    size: 5,
  }, // Tennis Ball
  {
    velocity: 0,
    positionY: 30,
    object: null,
    gravity: -50,
    bounce: 0.5,
    size: 3,
  }, // 8 ball
  {
    velocity: 0,
    positionY: 20,
    object: null,
    gravity: -20,
    bounce: 0.8,
    size: 12,
  }, // Basketball with higher bounce
  {
    velocity: 0,
    positionY: 20,
    object: null,
    gravity: -3,
    bounce: 0.7,
    size: 15,
  }, // BeachBall
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

  // Simulate free-fall for the spheres if not dragging
  if (!isDragging) {
    ballSimulation();
  }

  renderer.render(scene, camera);

  if (keyboard.pressed("R")) {
    ballData[0].positionY = 20;
    tennisBall.position.x = 0;

    ballData[1].positionY = 30;
    ball2.position.x = 15;

    ballData[2].positionY = 20;
    Basketball.position.x = -20;

    ballData[3].positionY = 20;
    BeachBall.position.x = -50;
  }
  update();
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

  // Tennis ball
  tennisBall = createBall(
    0,
    ballData[0].positionY,
    0,
    "texture/Tennis.jpg",
    ballData[0].size
  );
  ballData[0].object = tennisBall;

  // Ball 2 (Wooden Ball 2)
  ball2 = createBall(
    15,
    ballData[1].positionY,
    0,
    "texture/8ball.jpg",
    ballData[1].size
  );
  ballData[1].object = ball2;

  // Basketball
  Basketball = createBall(
    -20,
    ballData[2].positionY,
    0,
    "texture/Basketball.jpg",
    ballData[2].size
  );
  ballData[2].object = Basketball;

  BeachBall = createBall(
    -50,
    ballData[3].positionY,
    0,
    "texture/BeachBall.jpg",
    ballData[3].size
  );
  ballData[3].object = BeachBall;

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

function createBall(x, y, z, texturePath, size) {
  var geometryBall = new THREE.SphereGeometry(size, 32, 32); // Ball size now passed in
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

      // Adjust the bounce condition to account for ball's size and ground position
      if (ball.positionY <= ball.size + -5) {
        // Ground position is at y = -5
        ball.positionY = ball.size + -5; // Ensure the ball is positioned at ground level plus its radius
        ball.velocity = -ball.velocity * ball.bounce; // Adjust bounce based on size
      }

      ball.object.position.y = ball.positionY;
    }
  });
}

let hasDragged = false; // Track dragging state

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects([
    tennisBall,
    ball2,
    Basketball,
    BeachBall,
  ]);

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
        0
        // ballZPositions[
        //   draggableObject === tennisBall
        //     ? "tennisBall"
        //     : draggableObject === ball2
        //     ? "ball2"
        //     : "Basketball"
        // ]
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
    tennisBall.translateZ(moveDistance);
    ballZPositions.tennisBall = tennisBall.position.z; // Update Z position
  }

  if (keyboard.pressed("S")) {
    tennisBall.translateZ(-moveDistance);
    ballZPositions.tennisBall = tennisBall.position.z; // Update Z position
  }

  controls.update();
}
