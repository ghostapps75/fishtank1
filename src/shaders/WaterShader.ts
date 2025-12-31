import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

export const WaterMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color('#006994'),
        reflectionTexture: null, // Environment map or render target
        resolution: new THREE.Vector4(),
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Simplex Noise (simplified for brevity or replace with texture lookup)
    // For better water, we usually use normal maps.
    // I'll implement a procedural wave function here for "fresnel" and "surface" core requirements without external textures first
    // to ensure it works then add normal maps if texture loading is easy.
    
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    // Simple wave distortion
    float wave(vec2 uv, float t) {
        return sin(uv.x * 10.0 + t) * 0.1 + sin(uv.y * 8.0 + t * 0.5) * 0.1;
    }

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Fresnel
      float fresnelTerm = dot(viewDir, normal);
      fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
      fresnelTerm = pow(fresnelTerm, 3.0);

      // Color mixing
      vec3 waterColor = mix(color, vec3(0.8, 0.9, 1.0), fresnelTerm);

      // Fake refraction/reflection (just color variation for now)
      // Ideally we sample an environment map here.
      
      gl_FragColor = vec4(waterColor, 0.8); // Transparent
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

extend({ WaterMaterial })

// Add type definition for TS
declare global {
    namespace JSX {
        interface IntrinsicElements {
            waterMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                time?: number;
                color?: THREE.Color;
                args?: any[];
                uniforms?: any;
                attach?: string;
                transparent?: boolean;
                side?: THREE.Side;
            }
        }
    }
}
