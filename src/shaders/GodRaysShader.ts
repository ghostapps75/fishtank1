import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

export const GodRaysMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color('#fff'),
        alphaMap: null,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simple noise
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        // Scroll noise downwards
        float n = noise(vUv * vec2(5.0, 20.0) + vec2(0.0, time * 0.5));
        
        // Intensity fades at edges (cylinder/cone sides)
        float alpha = n * 0.3;
        
        // Vertical fade (stronger at top, fade at bottom)
        alpha *= smoothstep(0.0, 0.4, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));

        gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ GodRaysMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            godRaysMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                time?: number;
                color?: THREE.Color;
                transparent?: boolean;
                blending?: THREE.Blending;
                depthWrite?: boolean;
                side?: THREE.Side;
            }
        }
    }
}
