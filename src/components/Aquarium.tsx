import * as THREE from 'three'
import { useLoader, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import './../shaders/WaterShader' // Register material
import './../shaders/CausticsShader' // Register material
import './../shaders/GodRaysShader' // Register material

export function Aquarium() {
    // Load Floor Texture
    const floorTexture = useLoader(THREE.TextureLoader, '/images/sand.png')
    floorTexture.wrapS = THREE.RepeatWrapping
    floorTexture.wrapT = THREE.RepeatWrapping
    floorTexture.repeat.set(10, 10)

    const waterRef = useRef<any>(null)
    const causticsRef = useRef<any>(null)
    const godRaysRef = useRef<any>(null)

    useFrame((state) => {
        if (waterRef.current) {
            waterRef.current.time = state.clock.getElapsedTime()
        }
        if (causticsRef.current) {
            causticsRef.current.time = state.clock.getElapsedTime()
        }
        if (godRaysRef.current) {
            godRaysRef.current.time = state.clock.getElapsedTime()
        }
    })

    return (
        <group>
            {/* Tank Glass Box (Inverted normals or just back side for inside view) */}
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[20, 10, 20]} />
                <meshPhysicalMaterial
                    roughness={0}
                    transmission={0.9}
                    thickness={0.5}
                    side={THREE.BackSide}
                    color="#ffffff"
                    ior={1.5}
                />
            </mesh>

            {/* Water Surface */}
            <mesh position={[0, 9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20, 32, 32]} />
                {/* @ts-ignore */}
                <waterMaterial ref={waterRef} transparent side={THREE.DoubleSide} />
            </mesh>

            {/* Sandy Floor */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial map={floorTexture} color="#fff" roughness={1.0} />
            </mesh>

            {/* Caustics Overlay */}
            <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                {/* @ts-ignore */}
                <causticsMaterial ref={causticsRef} transparent blending={THREE.AdditiveBlending} />
            </mesh>

            {/* God Rays Volumetric */}
            <mesh position={[0, 5, 0]} rotation={[0, 0, 0]}>
                {/* Cone pointing down */}
                <cylinderGeometry args={[5, 8, 10, 32, 1, true]} />
                {/* @ts-ignore */}
                <godRaysMaterial ref={godRaysRef} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} color="#ddf" />
            </mesh>

            {/* Rocks */}
            <group>
                {[...Array(5)].map((_, i) => (
                    <mesh key={i} position={[Math.sin(i) * 5, 0.5, Math.cos(i) * 5]} rotation={[Math.random(), Math.random(), Math.random()]}>
                        <dodecahedronGeometry args={[0.5 + Math.random() * 0.5, 0]} />
                        <meshStandardMaterial color="#888" roughness={0.9} flatShading />
                    </mesh>
                ))}
            </group>
        </group>
    )
}
