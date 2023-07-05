import * as Three from 'three'
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import './style.css'

//scene
const scene = new Three.Scene();


//window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// earth sphere
const earthGeometry = new Three.SphereGeometry(3, 64, 64);
const earthWrapper = new Three.TextureLoader().load('images/earth.jpg');
const earthMaterial = new Three.MeshStandardMaterial({ map: earthWrapper });
const earth = new Three.Mesh(earthGeometry, earthMaterial);
scene.add(earth);



// Sun sphere
const sunGeometry = new Three.SphereGeometry(7, 64, 64);
const sunWrapper = new Three.TextureLoader().load('images/sun.jpg');
const sunMaterial = new Three.MeshBasicMaterial({ map: sunWrapper });
const sun = new Three.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 30, 90);
scene.add(sun);

// Lighting
const light = new Three.PointLight(0xffffff, 1, 150);
light.position.copy(sun.position);
scene.add(light);




//camera
const camera = new Three.PerspectiveCamera(60, sizes.width/sizes.height, 0.1, 150)
camera.position.z = 20
scene.add(camera)


//randomly generate a star
function addStar() {
    const geometry = new Three.SphereGeometry(0.1, 64, 64);
    const material = new Three.MeshStandardMaterial({ color: 0xffffff });
    const star = new Three.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => Three.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star);
}

const amountOfStars = 200

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
controls.autoRotateSpeed = .5



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

    //update controls
    controls.update()

    //rendering update
    renderer.render(scene, camera)
    window.requestAnimationFrame(loop)
}
loop()