import * as Three from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import "./style.css";
import VanillaTilt from "vanilla-tilt";
import emailjs from "@emailjs/browser";

//scene
const scene = new Three.Scene();

//window sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  isMobile: window.matchMedia("(max-width: 992px)").matches,
};

// Sun sphere
const sunGeometry = new Three.SphereGeometry(15, 50, 50);
const sunWrapper = new Three.TextureLoader().load("./images/sun.jpg");
const sunNormalTexture = new Three.TextureLoader().load(
  "./images/sun_normalmap.jpg"
);

const sunMaterial = new Three.MeshBasicMaterial({
  map: sunWrapper,
  normalMap: sunNormalTexture,
});
const sun = new Three.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, 0);
scene.add(sun);

// Lighting
const light = new Three.PointLight(0xffffff, 1, 1500);
light.position.copy(sun.position);
scene.add(light);

//camera
const camera = new Three.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-50, 80, 150);
scene.add(camera);

// Variables for initial and top-down positions
const initialCameraPosition = { x: -50, y: 90, z: 150 }; // Initial position
const topDownCameraPosition = { x: 0, y: 200, z: 0 }; // Top-down position

//NOTE: create planet
// planetTexture : MeshStandardMaterial with map and optional normalMap
const generatePlanet = (size, planetTexture, x, ring) => {
  const planetGeometry = new Three.SphereGeometry(size, 64, 64);
  const planetMaterial = new Three.MeshStandardMaterial({
    map: planetTexture.map,
    //only add normal map if it exists
    normalMap: planetTexture.normalMap != null ? planetTexture.normalMap : null,
  });

  const planet = new Three.Mesh(planetGeometry, planetMaterial);
  const planetObj = new Three.Object3D();
  planet.position.set(x, 0, 0);
  if (ring) {
    const ringGeo = new Three.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new Three.MeshBasicMaterial({
      map: ring.ringmat,
      side: Three.DoubleSide,
    });
    const ringMesh = new Three.Mesh(ringGeo, ringMat);
    planetObj.add(ringMesh);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(planetObj);

  planetObj.add(planet);
  createLineLoopWithMesh(x, 0xffffff, 3);
  return {
    planetObj: planetObj,
    planet: planet,
  };
};

//NOTE - path for planet
const path_of_planets = [];
function createLineLoopWithMesh(radius, color, width) {
  const material = new Three.LineBasicMaterial({
    color: color,
    linewidth: width,
  });
  const geometry = new Three.BufferGeometry();
  const lineLoopPoints = [];

  // Calculate points for the circular path
  const numSegments = 100; // Number of segments to create the circular path
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    lineLoopPoints.push(x, 0, z);
  }

  geometry.setAttribute(
    "position",
    new Three.Float32BufferAttribute(lineLoopPoints, 3)
  );
  const lineLoop = new Three.LineLoop(geometry, material);
  scene.add(lineLoop);
  path_of_planets.push(lineLoop);

  path_of_planets.forEach((path) => {
    path.visible = false;
  });
}

const mercuryTexture = {};
mercuryTexture.map = new Three.TextureLoader().load("./images/mercury.jpg");
mercuryTexture.normalMap = new Three.TextureLoader().load(
  "./images/mercury_normalmap.jpg"
);

const venusTexture = {};
venusTexture.map = new Three.TextureLoader().load("./images/venus.jpg");
venusTexture.normalMap = new Three.TextureLoader().load(
  "./images/venus_normalmap.jpg"
);

const earthTexture = {};
earthTexture.map = new Three.TextureLoader().load("./images/earth.jpg");
earthTexture.normalMap = new Three.TextureLoader().load(
  "./images/earth_normalmap.jpg"
);

const marsTexture = {};
marsTexture.map = new Three.TextureLoader().load("./images/mars.jpg");
marsTexture.normalMap = new Three.TextureLoader().load(
  "./images/mars_normalmap.jpg"
);

const jupiterTexture = {};
jupiterTexture.map = new Three.TextureLoader().load("./images/jupiter.jpg");
jupiterTexture.normalMap = new Three.TextureLoader().load(
  "./images/jupiter_normalmap.jpg"
);

const saturnTexture = {};
saturnTexture.map = new Three.TextureLoader().load("./images/saturn.jpg");
saturnTexture.normalMap = new Three.TextureLoader().load(
  "./images/saturn_normalmap.jpg"
);
saturnTexture.ring = new Three.TextureLoader().load("./images/saturn_ring.png");

const uranusTexture = {};
uranusTexture.map = new Three.TextureLoader().load("./images/uranus.jpg");
uranusTexture.ring = new Three.TextureLoader().load("./images/uranus_ring.png");

const neptuneTexture = {};
neptuneTexture.map = new Three.TextureLoader().load("./images/neptune.jpg");

const plutoTexture = {};
plutoTexture.map = new Three.TextureLoader().load("./images/pluto.jpg");
plutoTexture.normalMap = new Three.TextureLoader().load(
  "./images/pluto_normalmap.png"
);

const planets = [
  {
    ...generatePlanet(3.2, mercuryTexture, 28),
    rotaing_speed_around_sun: 0.004,
    self_rotation_speed: 0.004,
  },
  {
    ...generatePlanet(5.8, venusTexture, 44),
    rotaing_speed_around_sun: 0.015,
    self_rotation_speed: 0.002,
  },
  {
    ...generatePlanet(6, earthTexture, 62),
    rotaing_speed_around_sun: 0.01,
    self_rotation_speed: 0.02,
  },
  {
    ...generatePlanet(4, marsTexture, 78),
    rotaing_speed_around_sun: 0.008,
    self_rotation_speed: 0.018,
  },
  {
    ...generatePlanet(12, jupiterTexture, 100),
    rotaing_speed_around_sun: 0.002,
    self_rotation_speed: 0.04,
  },
  {
    ...generatePlanet(10, saturnTexture, 138, {
      innerRadius: 10,
      outerRadius: 20,
      ringmat: saturnTexture.ring,
    }),
    rotaing_speed_around_sun: 0.0009,
    self_rotation_speed: 0.038,
  },
  {
    ...generatePlanet(7, uranusTexture, 176, {
      innerRadius: 7,
      outerRadius: 12,
      ringmat: uranusTexture.ring,
    }),
    rotaing_speed_around_sun: 0.0004,
    self_rotation_speed: 0.03,
  },
  {
    ...generatePlanet(7, neptuneTexture, 200),
    rotaing_speed_around_sun: 0.0001,
    self_rotation_speed: 0.032,
  },
  {
    ...generatePlanet(2.8, plutoTexture, 216),
    rotaing_speed_around_sun: 0.0007,
    self_rotation_speed: 0.008,
  },
];

// Randomly generate a star within a specified area, filling both sides
function addStar() {
  const geometry = new Three.SphereGeometry(0.25, 64, 64);
  const material = new Three.MeshStandardMaterial({ color: 0xffffff });
  const star = new Three.Mesh(geometry, material);

  // Define the range for x, y, and z coordinates
  const minX = -250;
  const maxX = 250;
  const minY = -250;
  const maxY = 250;
  const minZ = 100;
  const maxZ = 250;

  // Generate random values within the specified range
  const x = Three.MathUtils.randFloat(minX, maxX);
  const y = Three.MathUtils.randFloat(minY, maxY);
  const z =
    Math.random() < 0.5
      ? Three.MathUtils.randFloat(minZ, maxZ)
      : Three.MathUtils.randFloat(-maxZ, -minZ);
  star.position.set(x, y, z);
  scene.add(star);
}

const amountOfStars = 100;

Array(amountOfStars).fill().forEach(addStar);

//renderer
const canvas = document.querySelector(".webgl");

const renderer = new Three.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

//controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

controls.enableZoom = false;
controls.autoRotate = true;

//dont allow rotating scene on mobile
if (sizes.isMobile) {
  controls.enableRotate = false;
  controls.autoRotateSpeed = 1;
} else {
  controls.enableRotate = true;
  controls.autoRotateSpeed = 0.5;
}

window.addEventListener("resize", () => {
  //set sizes on resize
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.updateProjectionMatrix();
  camera.aspect = sizes.width / sizes.height;

  //update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
});

//loop
const loop = () => {
  const speed = 0.3;
  sun.rotateY(speed * 0.004);
  planets.forEach(
    ({ planetObj, planet, rotaing_speed_around_sun, self_rotation_speed }) => {
      planetObj.rotateY(speed * rotaing_speed_around_sun);
      planet.rotateY(speed * self_rotation_speed);
    }
  );
  renderer.render(scene, camera);
};
renderer.setAnimationLoop(loop);

//opening animation
const timeLine = gsap.timeline({ defaults: { duration: 1 } });
timeLine.fromTo("nav", { y: "-200%" }, { y: "0%" });

function moveCamera() {
  // Get the current scroll position as a percentage
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = scrollTop / maxScroll;

  // Calculate the target X, Y, and Z positions based on scroll percentage
  const targetX =
    initialCameraPosition.x +
    (topDownCameraPosition.x - initialCameraPosition.x) * scrollPercentage;
  const targetY =
    initialCameraPosition.y +
    (topDownCameraPosition.y - initialCameraPosition.y) * scrollPercentage;
  const targetZ =
    initialCameraPosition.z +
    (topDownCameraPosition.z - initialCameraPosition.z) * scrollPercentage;

  // Animate camera movement using GSAP, smoothly transitioning the position
  gsap.to(camera.position, { duration: 1, x: targetX, y: targetY, z: targetZ });

  // Ensure the camera still looks at the center (0, 0, 0)
  camera.lookAt(0, 0, 0);
}

window.addEventListener("scroll", () => {
  moveCamera();
  console.log("scrolling");
  const currentPos = document.body.getBoundingClientRect().top;
  console.log(currentPos);
});

//make the project cards tilted
VanillaTilt.init(document.querySelectorAll(".project-container"));

//runs when project cards are in view
function handleIntersect(entries, observer) {
  entries.forEach(function (entry, index) {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");

      const projectsTimeline = gsap.timeline({ defaults: { duration: 0.7 } });
      projectsTimeline.fromTo(
        entry.target,
        { opacity: 0, y: "-50%" },
        { opacity: 1, y: "0%" }
      );

      projectsTimeline.pause();

      // Resume the timeline after a 500ms delay for each entry
      setTimeout(function () {
        projectsTimeline.play();
      }, index * 500);

      observer.unobserve(entry.target);
    }
  });
}

const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

const observer = new IntersectionObserver(handleIntersect, options);
const projectContainers = document.querySelectorAll(".project-container");

projectContainers.forEach((projectContainer) => {
  observer.observe(projectContainer);
});

//target = element to scroll to
function scrollIntoView(target) {
  document
    .querySelector(target)
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

//put listener on projects nav bar btn
const navBarProjects = document.querySelector(".nav-bar ul li a#nav-projects");
navBarProjects.addEventListener("click", (event) => {
  event.preventDefault();
  const targetId = navBarProjects.getAttribute("href");
  scrollIntoView(targetId);
});

//put listener on projects nav bar btn
const scrollProjectsBtn = document.querySelector(".scroll-div a");
scrollProjectsBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const targetId = scrollProjectsBtn.getAttribute("href");
  scrollIntoView(targetId);
});

//put listener on contact nav bar btn
const navBarContact = document.querySelector(".nav-bar ul li a#nav-contact");
navBarContact.addEventListener("click", (event) => {
  event.preventDefault();
  const targetId = navBarContact.getAttribute("href");
  scrollIntoView(targetId);
});

function initEmail() {
  emailjs.init("9iYZbQe_UVgKUFqOu");
}
initEmail();

const sendMailButton = document.querySelector("button.send");

sendMailButton.addEventListener("click", (event) => {
  event.preventDefault();
  sendEmail();
});

async function sendEmail() {
  const nameInput = document.querySelector("#inputName");
  const emailInput = document.querySelector("#inputEmail");
  const messageInput = document.querySelector("#inputMessage");

  const inputFields = {
    nameField: nameInput,
    emailField: emailInput,
    messageField: messageInput,
  };

  let toBeValidated = {
    name: nameInput.value,
    email: emailInput.value,
    message: messageInput.value,
    isValid: false,
  };

  toBeValidated = validateContactForm(toBeValidated, inputFields);

  if (toBeValidated.isValid) {
    const SERVICE_ID = "service_g3hvom4";
    const TEMPLATE_ID = "template_v2ns5ur";

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, {
        from_name: toBeValidated.name,
        from_email: toBeValidated.email,
        message: toBeValidated.message,
        reply_to: toBeValidated.email,
      })
      .then(
        function (response) {
          console.log("SUCCESS : ", response.status, response.text);

          nameInput.value = "";
          emailInput.value = "";
          messageInput.value = "";

          nameInput.style.outline = `none`;
          emailInput.style.outline = `none`;
          messageInput.style.outline = `none`;

          alert("Message send!");
        },
        function (err) {
          console.log("FAILED : ", err);
        }
      );
  }
}

function validateContactForm(toBeValidated, inputFields) {
  let nameIsValid = toBeValidated.name.trim().length !== 0;

  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  let emailIsValid = emailPattern.test(toBeValidated.email);

  let messageIsValid = toBeValidated.message.trim().length !== 0;

  if (nameIsValid && emailIsValid && messageIsValid) {
    toBeValidated.isValid = true;

    return toBeValidated;
  } else {
    const GOOD_STYLING = "solid green 1px";
    const BAD_STYLING = "solid red 1px";

    //name

    //check if value is valid
    if (!nameIsValid) {
      inputFields.nameField.style.outline = BAD_STYLING;
    } else {
      inputFields.nameField.style.outline = GOOD_STYLING;
    }

    inputFields.nameField.addEventListener("input", () => {
      //valid
      if (inputFields.nameField.value.trim().length !== 0) {
        inputFields.nameField.style.outline = GOOD_STYLING;
      }
      //not valid
      else {
        inputFields.nameField.style.outline = BAD_STYLING;
      }
    });

    //email

    //check if value is valid
    if (!emailIsValid) {
      inputFields.emailField.style.outline = BAD_STYLING;
    } else {
      inputFields.emailField.style.outline = GOOD_STYLING;
    }

    inputFields.emailField.addEventListener("input", () => {
      //valid
      if (emailPattern.test(inputFields.emailField.value)) {
        inputFields.emailField.style.outline = GOOD_STYLING;
      }
      //not valid
      else {
        inputFields.emailField.style.outline = BAD_STYLING;
      }
    });

    //message

    //check if value is valid
    if (!messageIsValid) {
      inputFields.messageField.style.outline = BAD_STYLING;
    } else {
      inputFields.messageField.style.outline = GOOD_STYLING;
    }

    inputFields.messageField.addEventListener("input", () => {
      //valid
      if (inputFields.messageField.value.trim().length !== 0) {
        inputFields.messageField.style.outline = GOOD_STYLING;
      }
      //not valid
      else {
        inputFields.messageField.style.outline = BAD_STYLING;
      }
    });

    return toBeValidated;
  }
}
