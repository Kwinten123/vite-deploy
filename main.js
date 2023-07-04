import * as Three from 'three'
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import './style.css'

//scene
const scene = new Three.Scene();

//sphere
const sphereGeometry = new Three.SphereGeometry(3, 64, 64)
const material = new Three.MeshStandardMaterial({color: "green"})
const sphere = new Three.Mesh( sphereGeometry, material );
scene.add(sphere);

//window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//lighting
const light = new Three.PointLight(0xffffff, 1, 100)
light.position.set(0, 20, 20)
scene.add(light)


//camera
const camera = new Three.PerspectiveCamera(45, sizes.width/sizes.height, 0.1, 100)
camera.position.z = 20
scene.add(camera)


//renderer
const canvas = document.querySelector(".webgl")

const renderer = new Three.WebGLRenderer({canvas})
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(2)
renderer.render(scene, camera)



//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 5



window.addEventListener('resize', () =>{

    //set sizes on resize
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.updateProjectionMatrix()
    camera.aspect = sizes.width/sizes.height

    //update renderer
    renderer.setSize(sizes.width, sizes.height)
})

//loop
const loop = () =>{

    //update controls
    controls.update()

    //rendering update
    renderer.render(scene, camera)
    window.requestAnimationFrame(loop)
}
loop()