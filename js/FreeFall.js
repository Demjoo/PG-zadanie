var camera, scene, renderer, controls; // Added 'controls'
var plane, tennisBall, blackBall, Basketball, background, plane1, plane2;
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
var objTrampoline;
let trampolineBox = null;
let waterBlock; // Water block variable
const minVelocityThreshold = 0.1; // Minimum velocity to stop bouncing
var trampolineMultiplier = 1.5;

// Gravity and physics variables for the ball simulation
var gravity = -20;
var timeStep = 0.05;
var windEnabled = false; // Toggle wind on/off
var windForce = { x: 10, z: 5 }; // Wind strength and direction

let obstacles = [
  { position: { x: -100, y: 100, z: 0 }, width: 40, height: 5 },
  { position: { x: 100, y: 80, z: 0 }, width: 40, height: 5 },
];

// Ball-specific properties
var ballData = [
  {
    velocity: 0,
    positionX: 0,
    positionY: 20,
    object: null,
    gravity: -20,
    bounce: 0.7,
    size: 5,
    windResistance: 0.2,
  }, // Tennis Ball
  {
    velocity: 0,
    positionX: 15,
    positionY: 30,
    object: null,
    gravity: -50,
    bounce: 0.5,
    size: 3,
    windResistance: 0.05,
  }, // 8 ball
  {
    velocity: 0,
    positionX: -20,
    positionY: 20,
    object: null,
    gravity: -20,
    bounce: 0.9,
    size: 12,
    windResistance: 0.15,
  }, // Basketball with higher bounce
  {
    velocity: 0,
    positionX: -50,
    positionY: 20,
    object: null,
    gravity: -3,
    bounce: 0.8,
    size: 15,
    windResistance: 0.3,
  }, // BeachBall
];

ballData.forEach((ball) => {
  ball.originalGravity = ball.gravity;
});

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
  createWindToggleButton();
  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.update();

  // Add objects
  addObjects();
  createSurfaceSelectionMenu(); // Add the dropdown menu

  // Event Listeners
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("mouseup", onMouseUp, false);

  updateSurface("brick"); // Set default surface
  createCustomBallMenu(); // Pridanie menu na obrazovku
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
    tennisBall.position.z = 0;

    ballData[1].positionY = 30;
    blackBall.position.x = 15;
    blackBall.position.z = 0;

    ballData[2].positionY = 20;
    Basketball.position.x = -20;
    Basketball.position.z = 0;

    ballData[3].positionY = 20;
    BeachBall.position.x = -50;
    BeachBall.position.z = 0;
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
    ballData[0].positionX,
    ballData[0].positionY,
    0,
    "texture/Tennis.jpg",
    ballData[0].size
  );
  ballData[0].object = tennisBall;

  // Log position for debugging
  console.log("Tennis Ball Position:", tennisBall.position);

  // Ball 2 (Wooden Ball 2)
  blackBall = createBall(
    ballData[1].positionX,
    ballData[1].positionY,
    0,
    "texture/8ball.jpg",
    ballData[1].size
  );
  ballData[1].object = blackBall;

  console.log("Black Ball Position:", blackBall.position);

  // Basketball
  Basketball = createBall(
    ballData[2].positionX,
    ballData[2].positionY,
    0,
    "texture/Basketball.jpg",
    ballData[2].size
  );
  ballData[2].object = Basketball;

  console.log("Basketball Position:", Basketball.position);

  // BeachBall
  BeachBall = createBall(
    ballData[3].positionX,
    ballData[3].positionY,
    0,
    "texture/BeachBall.jpg",
    ballData[3].size
  );
  ballData[3].object = BeachBall;

  console.log("Beach Ball Position:", BeachBall.position);

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
  loadObjWithMTL(
    "/models/trampoline/trampoline.obj",
    "/models/trampoline/trampoline.mtl",
    0.5,
    0.5,
    0.5,
    150,
    20,
    0
  );
  createObstacles();
}

function createObstacles() {
  // Create the first obstacle (thick plank)
  var geometryPlane1 = new THREE.BoxGeometry(40, 5, 40);
  var planeTexture1 = new THREE.TextureLoader().load("texture/brick_floor.jpg");
  var materialPlane1 = new THREE.MeshBasicMaterial({
    map: planeTexture1,
    side: THREE.DoubleSide,
  });
  var plane1 = new THREE.Mesh(geometryPlane1, materialPlane1);
  plane1.position.set(-100, 100, 0); // Position the plank to the left

  // Rotate the plank around the y-axis by 45 degrees
  plane1.rotation.x = -Math.PI / 4;
  const quaternion1 = new THREE.Quaternion();
  quaternion1.setFromEuler(
    new THREE.Euler(Math.PI / 2, Math.PI / 4, Math.PI / 2)
  );
  plane1.rotation.setFromQuaternion(quaternion1);
  scene.add(plane1);

  var geometryPlane2 = new THREE.BoxGeometry(40, 5, 40);
  var planeTexture1 = new THREE.TextureLoader().load("texture/brick_floor.jpg");
  var materialPlane2 = new THREE.MeshBasicMaterial({
    map: planeTexture1,
    side: THREE.DoubleSide,
  });
  plane2 = new THREE.Mesh(geometryPlane2, materialPlane2);
  plane2.position.set(100, 80, 0); // Position the plank to the left

  // Rotate the plank around the y-axis by 45 degrees
  plane2.rotation.x = -Math.PI / 4;
  const quaternion2 = new THREE.Quaternion();
  quaternion2.setFromEuler(
    new THREE.Euler(Math.PI / 2, -Math.PI / 4, Math.PI / 2)
  );
  plane2.rotation.setFromQuaternion(quaternion2);
  scene.add(plane2);
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
  // ak nie je potrebná globálna premenná tu definujte objekt objTrampoline;
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load(MTLpath, function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(objPath, function (object) {
      objTrampoline = object;
      objTrampoline.position.set(posX, posY, posZ);
      objTrampoline.scale.set(scalex, scaley, scalez);
      scene.add(objTrampoline);
    });
  });
}
// Add wind control button
function createWindToggleButton() {
  const button = document.createElement("button");
  button.id = "toggle-wind";
  button.innerText = "Toggle Wind";
  button.style.position = "absolute";
  button.style.top = "20px";
  button.style.right = "10px";
  button.style.zIndex = "1000";
  button.style.height = "30px";
  button.style.width = "120px";
  button.style.borderRadius = "7px";
  button.style.border = "2px solid #007BFF";
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    windEnabled = !windEnabled;
    button.innerText = windEnabled ? "Wind ON" : "Wind OFF";
  });
}

function ballSimulation() {
  if (objTrampoline) {
    trampolineBox = new THREE.Box3().setFromObject(objTrampoline);
  }

  ballData.forEach((ball) => {
    if (!isDragging || draggableObject !== ball.object) {
      ball.velocity += ball.gravity * timeStep;
      ball.positionY += ball.velocity * timeStep;

      if (windEnabled) {
        ball.object.position.x += windForce.x * ball.windResistance * timeStep;
        ball.object.position.z += windForce.z * ball.windResistance * timeStep;

        const rotationSpeed = 0.007;
        const windEffect = Math.sqrt(
          Math.pow(windForce.x, 2) + Math.pow(windForce.z, 2)
        );

        // Normalize wind direction
        const windDirection = new THREE.Vector3(
          windForce.x,
          0,
          windForce.z
        ).normalize();

        const rotationAmount =
          windEffect * ball.windResistance * rotationSpeed * 3;
        const randomFactor = 0.02 * (Math.random() - 0.5);

        ball.object.rotation.z -=
          (windDirection.z + randomFactor) * rotationAmount;
      }

      const ballBox = new THREE.Box3().setFromObject(ball.object);

      // Handle trampoline collision
      if (trampolineBox && trampolineBox.intersectsBox(ballBox)) {
        // Reverse velocity for bounce with higher multiplier
        ball.velocity =
          Math.abs(ball.velocity) * ball.bounce * trampolineMultiplier;
        if (Math.abs(ball.velocity) < 0.5) {
          trampolineMultiplier = 1.5;
        } else {
          trampolineMultiplier *= 0.9;
        }
        console.log("Ball velocity after trampoline bounce:", ball.velocity);

        // Adjust position above trampoline to prevent repeated collisions
        ball.positionY = trampolineBox.max.y + ball.size + 0.01; // Add small offset
      }

      // Handle ground collision
      if (ball.positionY <= ball.size + -5) {
        // Reverse velocity for bounce with decay
        ball.velocity = -ball.velocity * ball.bounce * 0.9;
        // Adjust position to ground level
        ball.positionY = ball.size + -5;

        // Stop bouncing if velocity is too small
        if (Math.abs(ball.velocity) < 0.1) {
          ball.velocity = 0;
        }
      }

      // Update ball's position in the scene
      ball.object.position.y = ball.positionY;
    }
  });
}

// Function to create the surface selection dropdown menu
function createSurfaceSelectionMenu() {
  const menuContainer = document.createElement("div");
  menuContainer.style.position = "absolute";
  menuContainer.style.top = "20px";
  menuContainer.style.left = "15px";
  menuContainer.style.zIndex = "1000";

  const label = document.createElement("label");
  label.setAttribute("for", "surface-select");
  label.innerText = "Select Surface: ";
  menuContainer.appendChild(label);

  const select = document.createElement("select");
  select.id = "surface-select";

  // Add options to the dropdown
  const surfaces = {
    brick: "Brick",
    grass: "Grass",
    wood: "Wood",
    trampoline: "Trampoline",
  };

  for (const [key, value] of Object.entries(surfaces)) {
    const option = document.createElement("option");
    option.value = key;
    option.innerText = value;
    select.appendChild(option);
  }

  menuContainer.appendChild(select);
  document.body.appendChild(menuContainer);

  // Add event listener for surface change
  select.addEventListener("change", (event) => {
    updateSurface(event.target.value);
  });
}

// Function to update the surface based on selection
function updateSurface(selectedSurface) {
  const surfaceProperties = {
    grass: { bounce: 0.5, friction: 0.7, texture: "texture/grass2.jpg" },
    wood: { bounce: 1, friction: 0.5, texture: "texture/wood2.jpg" },
    brick: { bounce: 1, friction: 0.6, texture: "texture/brick_floor.jpg" },
    trampoline: {
      bounce: 1.2,
      friction: 0.3,
      texture: "texture/trampoline.jpg",
    },
  };

  const surface = surfaceProperties[selectedSurface];

  if (!surface) {
    console.error(`Surface "${selectedSurface}" not found.`);
    return;
  }

  // Update plane texture
  const planeTexture = new THREE.TextureLoader().load(surface.texture);
  plane.material.map = planeTexture;
  plane.material.needsUpdate = true;

  // Update ball properties for the surface
  ballData.forEach((ball) => {
    ball.bounce *= surface.bounce;
  });
}

let hasDragged = false; // Track dragging state

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // include all balls (including custom ones)
  const allBalls = ballData.map((ball) => ball.object);
  var intersects = raycaster.intersectObjects(allBalls);

  if (intersects.length > 0) {
    trampolineMultiplier = 1.5;
    isDragging = true;
    hasDragged = false; // Resetting the drag state
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
      draggableObject.position.set(intersection.x, newY, 0);

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

function createCustomBallMenu() {
  const formContainer = document.createElement("div");
  formContainer.style.position = "absolute";
  formContainer.style.bottom = "10px";
  formContainer.style.left = "20px";
  formContainer.style.zIndex = "1000";
  formContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  formContainer.style.padding = "10px";
  formContainer.style.border = "1px solid black";

  const title = document.createElement("h4");
  title.innerText = "Add Custom Ball";
  formContainer.appendChild(title);

  const inputs = [
    { label: "Size", id: "customSize", type: "number", defaultValue: 5 },
    { label: "Bounce", id: "customBounce", type: "number", defaultValue: 0.7 },
    {
      label: "Gravity",
      id: "customGravity",
      type: "number",
      defaultValue: -20,
    },
    {
      label: "Wind Resistance",
      id: "customWindResistance",
      type: "number",
      defaultValue: 0.2,
    },
    // { label: "Position X", id: "customPosX", type: "number", defaultValue: 0 },
  ];

  inputs.forEach((input) => {
    const label = document.createElement("label");
    label.setAttribute("for", input.id);
    label.innerText = `${input.label}: `;
    formContainer.appendChild(label);

    const inputField = document.createElement("input");
    inputField.id = input.id;
    inputField.type = input.type;
    inputField.value = input.defaultValue;
    formContainer.appendChild(inputField);

    formContainer.appendChild(document.createElement("br"));
  });

  // Add color selection dropdown
  const colorLabel = document.createElement("label");
  colorLabel.setAttribute("for", "customColor");
  colorLabel.innerText = "Select Ball Color: ";
  formContainer.appendChild(colorLabel);

  const colorSelect = document.createElement("select");
  colorSelect.id = "customColor";

  // Options for color selection
  const colorOptions = [
    { value: "#808080", label: "Gray" },
    { value: "#0d0da5", label: "Blue" },
    { value: "#6e166e", label: "Purple" },
    { value: "#c66676", label: "Pink" },
    { value: "#a1a107", label: "Yellow" },
  ];

  colorOptions.forEach((colorOption) => {
    const option = document.createElement("option");
    option.value = colorOption.value;
    option.innerText = colorOption.label;
    colorSelect.appendChild(option);
  });

  formContainer.appendChild(colorSelect);
  formContainer.appendChild(document.createElement("br"));

  // Add button to create the custom ball
  const addButton = document.createElement("button");
  addButton.innerText = "Add Ball";
  addButton.style.marginTop = "10px";
  addButton.style.height = "30px";
  addButton.style.width = "70px";
  addButton.style.borderRadius = "7px";

  addButton.addEventListener("click", () => {
    const size = parseFloat(document.getElementById("customSize").value);
    const bounce = parseFloat(document.getElementById("customBounce").value);
    const gravity = parseFloat(document.getElementById("customGravity").value);
    const windResistance = parseFloat(
      document.getElementById("customWindResistance").value
    );
    const selectedColor = document.getElementById("customColor").value;

    addCustomBall(size, bounce, gravity, windResistance, -10, 0, selectedColor);
  });

  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

function addCustomBall(
  size,
  bounce,
  gravity,
  windResistance,
  posY,
  posZ,
  color
) {
  // We get the last ball from the ballData list (assuming at least one ball has already been added)
  const lastBall = ballData[ballData.length - 1];
  console.log("last ball", lastBall);

  // We determine the X position of the new ball based on the X position of the last ball.
  const posX = lastBall
    ? lastBall.object.position.x - lastBall.size * 2 - size * 2
    : 0;

  // We create a new ball with the selected color as its texture
  const newBall = createBallWithColor(posX, posY, posZ, color, size);

  // We add the new ball to the simulation
  ballData.push({
    velocity: 0,
    positionY: posY,
    object: newBall,
    gravity: gravity,
    bounce: bounce,
    size: size,
    windResistance: windResistance,
  });
}

function createBallWithColor(x, y, z, color, size) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const ball = new THREE.Mesh(geometry, material);
  ball.position.set(x, y, z);
  scene.add(ball);
  return ball;
}

function update() {
  controls.update();
}
