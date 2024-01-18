import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {ArcballControls} from 'three/examples/jsm/controls/ArcballControls'
import * as dat from 'lil-gui'
import { FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

//Shaders
import simVertex from './Shaders/Particles/FBO/simulation.vert?raw'
import simFrag from './Shaders/Particles/FBO/simulation.frag?raw'
import renderVertex from './Shaders/Particles/FBO/render.vert?raw'
import renderFrag from './Shaders/Particles/FBO/render.frag?raw'


class Sketch { 
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(100, 1, 0.1, 2000)
        this.canvas = document.querySelector('canvas.webgl')
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas})
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true
        this.width = 128
        this.height = 128
        this.size = 128

        this.sizes = {}
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight 

        this.clock = new THREE.Clock()

        this.setup()
        this.testMesh()
        this.setFBO()
        this.eventListeners()
        this.renderLoop()
    }

    setup() {
        this.camera.position.set(0, 20, 20)
        this.scene.add(this.camera)

        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.ambientLight = new THREE.AmbientLight('white', 0.3)
        this.pointLightLeft = new THREE.PointLight(0xffffff, 0.4)
        this.pointLightRight = new THREE.PointLight(0xffffff, 0.4)
        this.pointLightLeft.position.set(-190, 190, 180)
        this.pointLightRight.position.set(190, 190, 180)


        this.scene.add(this.ambientLight)
        this.scene.add(this.pointLightLeft)
        this.scene.add(this.pointLightRight)
    }

    testMesh() {
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(5, 32, 32),
            new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
        )

        this.scene.add(sphere)

    }

    eventListeners() {
        window.addEventListener('resize', () => {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight

            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    setFBO() {
        //returns an array of random 3D coordinates
        function getRandomData(count, size ){
        
            var len = count * 4;
            var data = new Float32Array( len );
            while( len-- )data[len] = ( Math.random() * 2 - 1 ) * size;
            return data;
        }

        function getPoint(v, size) {
            //the 'discard' method, not the most efficient
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
            v.z = Math.random() * 2 - 1;
            v.w = 0.0;
            if (v.length() > 1) return getPoint(v, size);
            return v.normalize().multiplyScalar(size);
        }

        //returns a Float32Array buffer of spherical 3D points
        function getSphere(count, size) {

            var len = count * 4;
            var data = new Float32Array(len);
            var p = new THREE.Vector3();
            for (var i = 0; i < len; i += 4) {
                getPoint(p, size);
                data[i] = p.x;
                data[i + 1] = p.y;
                data[i + 2] = p.z;
                data[i + 3] = 0.0;
            }
            return data;
        }

        
        //then you convert it to a Data texture:
        var cubeData = getRandomData( this.width * this.height, this.size );
        this.cubeTexture = new THREE.DataTexture( cubeData, this.width, this.height, THREE.RGBAFormat, THREE.FloatType );
        this.cubeTexture.needsUpdate = true;

        var sphereData = getSphere(this.width * this.height, this.size)
        this.sphereTexture = new THREE.DataTexture( sphereData, this.width, this.height, THREE.RGBAFormat, THREE.FloatType);
        this.sphereTexture.needsUpdate = true;

        //simulation shader used to update the particles' positions
        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: { 
                uCubePositions: { type: "t", value: this.cubeTexture },
                uSpherePositions: {type: "t", value: this.sphereTexture},
                uTime: { value: null}
            },
            vertexShader: simVertex,
            fragmentShader:  simFrag
        })

        this.renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                uPositions: { type: "t", value: null },
                pointSize: { type: "f", value: 2 }
            },
            vertexShader: renderVertex,
            fragmentShader: renderFrag
        })

        var gl = this.renderer.getContext()

        // //1 we need FLOAT Textures to store positions
        // //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
        // if (!gl.getExtension("OES_texture_float")){
        //     throw new Error( "float textures not supported" )
        // }

        // //2 we need to access textures from within the vertex shader
        // //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
        // if( gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0 ) {
        //     throw new Error( "vertex shader cannot read textures" )
        // }

        //3 this.RenderTargetTexture1 setup
        this.fboScene = new THREE.Scene()
        this.fboOrthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1)

        //4 create a target texture
        var options = {
            minFilter: THREE.NearestFilter,//important as we want to sample square pixels
            magFilter: THREE.NearestFilter,//
            format: THREE.RGBAFormat,//could be RGBAFormat 
            type:THREE.FloatType//important as we need precise coordinates (not ints)
        };

        // Two render targets
        this.RenderTargetTexture1 = new THREE.WebGLRenderTarget( this.width, this.height, options)
        this.RenderTargetTexture2 = new THREE.WebGLRenderTarget( this.width, this.height, options)


        //5 the simulation:
        //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
        var geom = new THREE.BufferGeometry()
        geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array([   -1,-1,0, 1,-1,0, 1,1,0, -1,-1, 0, 1, 1, 0, -1,1,0 ]), 3 ) )
        geom.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array([   0,1, 1,1, 1,0,     0,1, 1,0, 0,0 ]), 2 ) )
        this.fboScene.add( new THREE.Mesh( geom, this.simulationShader ) )


        //6 the particles:
        //create a vertex buffer of size width * height with normalized coordinates
        var l = (this.width * this.height );
        var vertices = new Float32Array( l * 3 )
        for ( var i = 0; i < l; i++ ) {
            var i3 = i * 3
            vertices[ i3 ] = ( i % this.width ) / this.width 
            vertices[ i3 + 1 ] = ( i / this.width ) / this.height
        }

        //create the particles geometry
        var geometry = new THREE.BufferGeometry()
        geometry.setAttribute( 'position',  new THREE.BufferAttribute( vertices, 3 ) )
        this.particles = new THREE.Points(geometry, this.renderShader)

        this.scene.add(this.particles)

        this.renderShader.uniforms.uPositions.value = this.RenderTargetTexture1.texture

        this.renderer.setRenderTarget(this.RenderTargetTexture1)
        this.renderer.render(this.fboScene, this.fboOrthoCamera)
    
    }

    

    renderLoop() {
        const tick = () =>
        {
            const elapsedTime = this.clock.getElapsedTime()
            this.controls.update()

            this.simulationShader.uniforms.uTime.value = elapsedTime
            this.simulationShader.uniforms.uCubePositions.value = this.cubeTexture
            this.simulationShader.uniforms.uSpherePositions.value = this.sphereTexture

            this.particles.material.uniforms.uPositions.value = this.RenderTargetTexture1.texture

            this.renderer.setRenderTarget(this.RenderTargetTexture1)
            this.renderer.render(this.fboScene, this.fboOrthoCamera)
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.scene, this.camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }

}


const sketch = new Sketch()
