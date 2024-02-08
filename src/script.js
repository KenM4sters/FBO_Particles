import Experience from "./Experience/Experience";

const experience = new Experience(document.querySelector('.webgl'));


// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import {ArcballControls} from 'three/examples/jsm/controls/ArcballControls'
// import * as dat from 'lil-gui'
// import { FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// //Shaders
// import simVertex from './Shaders/Particles/FBO/simulation.vert?raw'
// import simFrag from './Shaders/Particles/FBO/simulation.frag?raw'
// import renderVertex from './Shaders/Particles/FBO/render.vert?raw'
// import renderFrag from './Shaders/Particles/FBO/render.frag?raw'


// class Sketch { 
//     constructor() {
//         this.scene = new THREE.Scene()
//         this.camera = new THREE.PerspectiveCamera(100, 1, 0.1, 2000)
//         this.canvas = document.querySelector('canvas.webgl')
//         this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas})
//         this.controls = new OrbitControls(this.camera, this.canvas)
//         this.controls.enableDamping = true
//         this.width = 128
//         this.height = 128
//         this.size = 128

//         this.sizes = {}
//         this.sizes.width = window.innerWidth
//         this.sizes.height = window.innerHeight 

//         this.clock = new THREE.Clock()

//         this.setup()
//         this.testMesh()
//         this.setFBO()
//         this.eventListeners()
//         this.renderLoop()
//     }

//     setup() {
//         this.camera.position.set(0, 20, 20)
//         this.scene.add(this.camera)

//         this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
//         this.renderer.setSize(this.sizes.width, this.sizes.height)
//         this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//         this.ambientLight = new THREE.AmbientLight('white', 0.3)
//         this.pointLightLeft = new THREE.PointLight(0xffffff, 0.4)
//         this.pointLightRight = new THREE.PointLight(0xffffff, 0.4)
//         this.pointLightLeft.position.set(-190, 190, 180)
//         this.pointLightRight.position.set(190, 190, 180)


//         this.scene.add(this.ambientLight)
//         this.scene.add(this.pointLightLeft)
//         this.scene.add(this.pointLightRight)
//     }

//     testMesh() {
//         var sphere = new THREE.Mesh(
//             new THREE.SphereGeometry(5, 32, 32),
//             new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
//         )

//         this.scene.add(sphere)

//     }

//     eventListeners() {
//         window.addEventListener('resize', () => {
//             // Update sizes
//             this.sizes.width = window.innerWidth
//             this.sizes.height = window.innerHeight

//             // Update camera
//             this.camera.aspect = this.sizes.width / this.sizes.height
//             this.camera.updateProjectionMatrix()

//             // Update renderer
//             this.renderer.setSize(this.sizes.width, this.sizes.height)
//             this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//         })
//     }



    

//     renderLoop() {
//         const tick = () =>
//         {
//             const elapsedTime = this.clock.getElapsedTime()
//             this.controls.update()

//             this.simulationShader.uniforms.uTime.value = elapsedTime
//             this.simulationShader.uniforms.uCubePositions.value = this.cubeTexture
//             this.simulationShader.uniforms.uSpherePositions.value = this.sphereTexture

//             this.particles.material.uniforms.uPositions.value = this.RenderTargetTexture1.texture

//             this.renderer.setRenderTarget(this.RenderTargetTexture1)
//             this.renderer.render(this.fboScene, this.fboOrthoCamera)
//             this.renderer.setRenderTarget(null)
//             this.renderer.render(this.scene, this.camera)

//             // Call tick again on the next frame
//             window.requestAnimationFrame(tick)
//         }

//         tick()
//     }

// }


// const sketch = new Sketch()
