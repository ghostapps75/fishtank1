import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

export const CausticsMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color('#ffffff'),
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;

    // Voronoi-ish or Cellular noise function
    vec2 rand2(vec2 p) {
        return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
    }

    float voronoi(vec2 x, float t) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float m = 8.0;
        for(int j=-1; j<=1; j++)
        for(int i=-1; i<=1; i++) {
            vec2 g = vec2(float(i),float(j));
            vec2 o = rand2(n + g);
            // Animate the point
            o = 0.5 + 0.5*sin(t + 6.2831*o);
            vec2 r = g + o - f;
            float d = dot(r,r);
            m = min(m,d);
        }
        return m;
    }

    void main() {
        // Two layers of cellular noise for "caustics" look
        float v1 = voronoi(vUv * 15.0, time * 1.5);
        float v2 = voronoi(vUv * 15.0 + 5.0, time * 2.0);
        
        // Invert for light lines
        float intensity = (1.0 - v1) * (1.0 - v2);
        intensity = pow(intensity, 3.0) * 5.0; // Sharpen and brighten
        
        // Chromatic aberration (fake by offset)
        // Ignoring for now to keep it simple white light patterns
        
        gl_FragColor = vec4(color * intensity, 1.0);
        // We will maintain alpha blending in material settings
    }
  `
)

extend({ CausticsMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            causticsMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                time?: number;
                color?: THREE.Color;
                args?: any[];
                transparent?: boolean;
                blending?: THREE.Blending;
            }
        }
    }
}
