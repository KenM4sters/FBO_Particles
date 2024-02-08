//fragment Shader
uniform sampler2D uCubePositions;//DATA Texture containing original positions
uniform sampler2D uSpherePositions;
uniform float uTime;
varying vec2 vUv;
void main() {

    //basic simulation: displays the particles in place.
    vec3 cubePos = texture2D( uCubePositions, vUv ).xyz;
    vec3 spherePos = texture2D( uSpherePositions, vUv ).xyz;


    vec3 pos = mix(cubePos, spherePos, abs(sin(uTime * 5.0)));

    // pos.x += uTime * 10.0;
    /*
        we can move the particle here 
    */
    gl_FragColor = vec4(pos, 1.0);
}