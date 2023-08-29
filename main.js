import * as Three from 'three'
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import './style.css'
import VanillaTilt from "vanilla-tilt";
import emailjs from "@emailjs/browser";



//scene
const scene = new Three.Scene();


//window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile : window.matchMedia("(max-width: 992px)").matches
}


// earth sphere
const earthGeometry = new Three.SphereGeometry(3, 64, 64);
const earthWrapper = new Three.TextureLoader().load('./images/earth.jpg');
const earthNormalTexture = new Three.TextureLoader().load('./images/earth_normalmap.jpg')
const earthMaterial = new Three.MeshStandardMaterial({
    map: earthWrapper,
    normalMap: earthNormalTexture
});
const earth = new Three.Mesh(earthGeometry, earthMaterial);
earth.position.set(0, 0, 0);
scene.add(earth);


// Sun sphere
const sunGeometry = new Three.SphereGeometry(4, 64, 64);
const sunWrapper = new Three.TextureLoader().load('./images/sun.jpg');
const sunNormalTexture = new Three.TextureLoader().load('./images/sun_normalmap.jpg')

const sunMaterial = new Three.MeshBasicMaterial({
    map: sunWrapper,
    normalMap : sunNormalTexture
});
const sun = new Three.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, 90);
scene.add(sun);


// moon sphere
const moonGeometry = new Three.SphereGeometry(.75, 64, 64);
const moonWrapper = new Three.TextureLoader().load('./images/moon.jpg');
const moonNormalTexture = new Three.TextureLoader().load('./images/moon_normalmap.jpg')

const moonMaterial = new Three.MeshStandardMaterial({
    map: moonWrapper,
    normalMap : moonNormalTexture
});
const moon = new Three.Mesh(moonGeometry, moonMaterial);
moon.position.set(20, 0, 12);
scene.add(moon);


// Lighting
const light = new Three.PointLight(0xffffff, 1, 1500);
light.position.copy(sun.position);
scene.add(light);




//camera
const camera = new Three.PerspectiveCamera(50, sizes.width/sizes.height, 0.1, 1000)
camera.position.z = 30
camera.position.y = 10
scene.add(camera)


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
    const z = Math.random() < 0.5 ? Three.MathUtils.randFloat(minZ, maxZ) : Three.MathUtils.randFloat(-maxZ, -minZ);
    star.position.set(x, y, z);
    scene.add(star);
}



const amountOfStars = 100

Array(amountOfStars).fill().forEach(addStar);




//renderer
const canvas = document.querySelector(".webgl")

const renderer = new Three.WebGLRenderer({canvas})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(2)
renderer.render(scene, camera)



//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false

controls.enableZoom = false
controls.autoRotate = true

//dont allow rotating scene on mobile
if (sizes.isMobile){
    controls.enableRotate = false
    controls.autoRotateSpeed = 1
}
else {
    controls.enableRotate = true
    controls.autoRotateSpeed = .5
}



window.addEventListener('resize', () =>{


    //set sizes on resize
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.updateProjectionMatrix()
    camera.aspect = sizes.width/sizes.height

    //update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.render(scene, camera)
})

//loop
const loop = () =>{

    //rotate the world
    earth.rotation.y += 0.002

    //rotate the moon
    moon.rotation.y += 0.002

    //update controls
    controls.update()

    //rendering update
    renderer.render(scene, camera)
    window.requestAnimationFrame(loop)
}
loop()

//opening animation
const timeLine = gsap.timeline({defaults: {duration : 1}})
timeLine.fromTo("nav", {y: "-200%"}, {y: "0%"})


//scroll function
function moveCamera() {
  const currentPos = document.body.getBoundingClientRect().top;
  const targetY = currentPos * -0.05;

    
    // Animate camera movement using GSAP
      gsap.to(camera.position, { duration: 1, y: targetY });


    // Update camera lookAt to center on the spheres
    camera.lookAt(0, 0, 0);
}

window.addEventListener("scroll", moveCamera);



//make the project cards tilted
VanillaTilt.init(document.querySelectorAll(".project-container"));

//runs when project cards are in view
function handleIntersect(entries, observer) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
          entry.target.classList.add("active");

          const projectsTimeline = gsap.timeline({defaults: {duration : .7}})
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
    threshold: 0.5 
  };

  const observer = new IntersectionObserver(handleIntersect, options);
  const projectContainers = document.querySelectorAll(".project-container");

  projectContainers.forEach((projectContainer) => {
      observer.observe(projectContainer);
  });

//target = element to scroll to
function scrollIntoView(target) {
  document.querySelector(target).scrollIntoView({ behavior: 'smooth', block: 'start' });
}


//put listener on projects nav bar btn
const navBarProjects = document.querySelector(".nav-bar ul li a#nav-projects")
navBarProjects.addEventListener("click", (event) => {
    event.preventDefault();
      const targetId = navBarProjects.getAttribute('href');
    scrollIntoView(targetId)
})

//put listener on projects nav bar btn
const scrollProjectsBtn = document.querySelector(".scroll-div a")
scrollProjectsBtn.addEventListener("click", (event) => {
    event.preventDefault();
      const targetId = scrollProjectsBtn.getAttribute('href');
    scrollIntoView(targetId)
})

//put listener on contact nav bar btn
const navBarContact = document.querySelector(".nav-bar ul li a#nav-contact")
navBarContact.addEventListener("click", (event) => {
    event.preventDefault();
      const targetId = navBarContact.getAttribute('href');
    scrollIntoView(targetId)
})


function initEmail() {
    emailjs.init('9iYZbQe_UVgKUFqOu');
}initEmail();


const sendMailButton = document.querySelector("button.send")

sendMailButton.addEventListener("click", (event) =>{
    event.preventDefault()
    sendEmail()
})




async function sendEmail() {
    const nameInput = document.querySelector("#inputName")
    const emailInput = document.querySelector("#inputEmail")
    const messageInput = document.querySelector("#inputMessage")

    const inputFields = {
        nameField : nameInput,
        emailField : emailInput,
        messageField : messageInput
    }

    let toBeValidated = {
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value,
        isValid: false
    }

    toBeValidated = validateContactForm(toBeValidated, inputFields)


    if (toBeValidated.isValid) {
        const SERVICE_ID = "service_g3hvom4"
        const TEMPLATE_ID = "template_v2ns5ur"

        emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            from_name: toBeValidated.name,
            from_email: toBeValidated.email,
            message: toBeValidated.message,
            reply_to: toBeValidated.email,
        }).then(function (response) {
            console.log('SUCCESS : ', response.status, response.text);

            nameInput.value = ""
            emailInput.value = ""
            messageInput.value = ""

            nameInput.style.outline = `none`
            emailInput.style.outline = `none`
            messageInput.style.outline = `none`

            alert("Message send!")

        }, function (err) {
            console.log('FAILED : ', err);
        });
    }
}

function validateContactForm(toBeValidated, inputFields){
    let nameIsValid = toBeValidated.name.trim().length !== 0

    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    let emailIsValid = emailPattern.test(toBeValidated.email);

    let messageIsValid = toBeValidated.message.trim().length !== 0

    if (nameIsValid && emailIsValid && messageIsValid){
        toBeValidated.isValid = true

        return toBeValidated
    }
    else {


        const GOOD_STYLING = "solid green 1px"
        const BAD_STYLING = "solid red 1px"


        //name

        //check if value is valid
        if (!nameIsValid){
            inputFields.nameField.style.outline = BAD_STYLING
        }
        else{
            inputFields.nameField.style.outline = GOOD_STYLING
        }

        inputFields.nameField.addEventListener("input", () =>{
            //valid
            if (inputFields.nameField.value.trim().length !== 0){
                inputFields.nameField.style.outline = GOOD_STYLING
            }
            //not valid
            else {
                inputFields.nameField.style.outline = BAD_STYLING
            }
        })


        //email

        //check if value is valid
        if (!emailIsValid){
            inputFields.emailField.style.outline = BAD_STYLING
        }
        else{
            inputFields.emailField.style.outline = GOOD_STYLING
        }


        inputFields.emailField.addEventListener("input", () =>{
            //valid
            if (emailPattern.test(inputFields.emailField.value)){
                inputFields.emailField.style.outline = GOOD_STYLING
            }
            //not valid
            else {
                inputFields.emailField.style.outline = BAD_STYLING
            }
        })

        //message

        //check if value is valid
        if (!messageIsValid){
            inputFields.messageField.style.outline = BAD_STYLING
        }
        else{
            inputFields.messageField.style.outline = GOOD_STYLING
        }


        inputFields.messageField.addEventListener("input", () =>{

            //valid
            if (inputFields.messageField.value.trim().length !== 0){
                inputFields.messageField.style.outline = GOOD_STYLING
            }
            //not valid
            else {
                inputFields.messageField.style.outline = BAD_STYLING
            }
        })

        return toBeValidated
    }
}







  

