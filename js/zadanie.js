var camera, scene, renderer;
var plane, ball1, ball2, background;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();

// Gravity and physics variables for the ball simulation
var gravity = -20; // Stronger gravity for faster falling
var timeStep = 0.05; // Larger time step for faster simulation

// Ball-specific properties
var ballData = [
  { velocity: 0, positionY: 20, object: null }, // Ball 1
  { velocity: 0, positionY: 30, object: null }, // Ball 2
];

// Drag-and-drop variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var isDragging = false;
var draggableObject = null;

var ballData = [
  { velocity: 0, positionY: 20, object: null, gravity: -20 }, // Ball 1 (normal gravity)
  { velocity: 0, positionY: 30, object: null, gravity: -50 }, // Ball 2 (heavier, falls faster)
];

init();
render();

function init() {
  // Camera Setup (Fixed position)
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 50, 100);
  camera.lookAt(0, 0, 0); // Keep the camera focused on the center

  // Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Scene Setup
  scene = new THREE.Scene();

  // Add objects: Sphere and Plane
  addObjects();

  // Event Listeners for Drag-and-Drop
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mouseup", onMouseUp, false);
}

function render() {
  requestAnimationFrame(render);

  // Simulate free-fall for the spheres if not dragging
  if (!isDragging) {
    ballSimulation();
  }

  renderer.render(scene, camera);
  if (keyboard.pressed("R")) {
    ballData[0].positionY = 20; // Reset Ball 1
    ballData[1].positionY = 30; // Reset Ball 2
  }
}

function addObjects() {
  // Ground Plane

  var light = new THREE.AmbientLight(0x404040, 1); // Ambient light
  scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  var geometryPlane = new THREE.PlaneGeometry(400, 400, 4, 4);
  var planeTexture = new THREE.TextureLoader().load("texture/brick_floor.jpg"); // Use TextureLoader for better compatibility
  var materialPlane = new THREE.MeshStandardMaterial({
    map: planeTexture,
    side: THREE.DoubleSide, // Ensure the texture appears on both sides
  });

  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(0, -5, 0); // Adjusted to serve as ground
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  // Ball 1
  ball1 = createBall(0, ballData[0].positionY, 0, "texture/wood.png");
  ballData[0].object = ball1;

  // Ball 2
  ball2 = createBall(10, ballData[1].positionY, 0, "texture/carbon.png");
  ballData[1].object = ball2;

  // Background Sphere (Sky)
  var geometryBackground = new THREE.SphereGeometry(200, 200, 200);
  var backgroundTexture = new THREE.ImageUtils.loadTexture("texture/sky.jpg");
  var materialBackground = new THREE.MeshBasicMaterial({
    map: backgroundTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  background = new THREE.Mesh(geometryBackground, materialBackground);
  background.position.set(0, 0, 0);
  scene.add(background);
}

function createBall(x, y, z, texturePath) {
  var geometryBall = new THREE.SphereGeometry(5, 64, 64);
  var ballTexture = new THREE.ImageUtils.loadTexture(texturePath);
  var materialBall = new THREE.MeshBasicMaterial({
    map: ballTexture,
  });
  var ball = new THREE.Mesh(geometryBall, materialBall);
  ball.position.set(x, y, z);
  scene.add(ball);
  return ball;
}

// Ball simulation function to handle gravity-based movement
function ballSimulation() {
  ballData.forEach((ball) => {
    if (!isDragging || draggableObject !== ball.object) {
      // Update velocity and position using simple physics (v = u + at, s = s0 + vt)
      ball.velocity += ball.gravity * timeStep; // Velocity update (use ball's gravity)
      ball.positionY += ball.velocity * timeStep; // Position update

      // Check for collision with ground (plane is at y = -5 for the larger ball)
      if (ball.positionY <= 0) {
        // Considering ball's radius is 5
        ball.positionY = 0;
        ball.velocity = -ball.velocity * 0.5; // Inelastic bounce (damping)
      }

      // Update sphere position
      ball.object.position.y = ball.positionY;
    }
  });
}

// Mouse Events for Drag-and-Drop
function onMouseDown(event) {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check if either sphere is clicked
  var intersects = raycaster.intersectObjects([ball1, ball2]);
  if (intersects.length > 0) {
    isDragging = true;
    draggableObject = intersects[0].object;
    ballData.forEach((ball) => {
      if (ball.object === draggableObject) ball.velocity = 0; // Stop gravity for the selected ball
    });
  }
}

function onMouseMove(event) {
  if (isDragging && draggableObject) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Create a virtual plane aligned with the camera
    var dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.setFromCamera(mouse, camera);

    // Find the intersection of the ray with the drag plane
    var intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);

    if (intersection) {
      // Enforce the Y-coordinate constraint
      const groundLevel = -5 + 5; // Plane Y (-5) + Ball radius (5)
      const newY = Math.max(intersection.y, groundLevel);

      // Update the ball's position based on the constrained intersection
      draggableObject.position.set(intersection.x, newY, 0); // Keep Z fixed
      ballData.forEach((ball) => {
        if (ball.object === draggableObject) ball.positionY = newY; // Update the specific ball's Y position
      });
    }
  }
}

function onMouseUp() {
  if (isDragging) {
    isDragging = false;
    draggableObject = null;
  }
}
