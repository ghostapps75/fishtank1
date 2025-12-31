import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const COHESION_DISTANCE = 2
const ALIGNMENT_DISTANCE = 2
const SEPARATION_DISTANCE = 1
const MAX_SPEED = 0.1
const MAX_FORCE = 0.005
const BOUNDARY = 10

const COUNT = 500

export function FishFlock() {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const fishTexture = useLoader(THREE.TextureLoader, '/images/fish.png')

    // Initial positions and velocities
    const particles = useMemo(() => {
        const data = []
        for (let i = 0; i < COUNT; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * BOUNDARY * 1.5,
                (Math.random() - 0.5) * BOUNDARY,
                (Math.random() - 0.5) * BOUNDARY * 1.5
            )
            const velocity = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize().multiplyScalar(MAX_SPEED)

            data.push({ position, velocity, acceleration: new THREE.Vector3() })
        }
        return data
    }, [])

    useFrame(() => {
        if (!meshRef.current) return

        for (let i = 0; i < COUNT; i++) {
            const fish = particles[i]
            const position = fish.position
            const velocity = fish.velocity
            const acceleration = fish.acceleration

            acceleration.set(0, 0, 0)

            let cohesionSum = new THREE.Vector3()
            let alignmentSum = new THREE.Vector3()
            let separationSum = new THREE.Vector3()
            let neighborCount = 0

            // Boids Logic
            for (let j = 0; j < COUNT; j++) {
                if (i === j) continue
                const other = particles[j]
                const distance = position.distanceTo(other.position)

                if (distance < COHESION_DISTANCE) {
                    cohesionSum.add(other.position)
                    neighborCount++
                }
                if (distance < ALIGNMENT_DISTANCE) {
                    alignmentSum.add(other.velocity)
                }
                if (distance < SEPARATION_DISTANCE) {
                    const diff = new THREE.Vector3().subVectors(position, other.position)
                    diff.normalize().divideScalar(distance)
                    separationSum.add(diff)
                }
            }

            if (neighborCount > 0) {
                cohesionSum.divideScalar(neighborCount).sub(position).setLength(MAX_SPEED).sub(velocity).clampLength(0, MAX_FORCE)
                alignmentSum.divideScalar(neighborCount).setLength(MAX_SPEED).sub(velocity).clampLength(0, MAX_FORCE)
                separationSum.divideScalar(neighborCount).setLength(MAX_SPEED).sub(velocity).clampLength(0, MAX_FORCE)

                acceleration.add(cohesionSum.multiplyScalar(1.0))
                acceleration.add(alignmentSum.multiplyScalar(1.0))
                acceleration.add(separationSum.multiplyScalar(1.5))
            }

            // Boundary Avoidance (Box)
            if (position.x > BOUNDARY) acceleration.x -= 0.05
            if (position.x < -BOUNDARY) acceleration.x += 0.05
            if (position.y > BOUNDARY / 2) acceleration.y -= 0.05
            if (position.y < -BOUNDARY / 2) acceleration.y += 0.05
            if (position.z > BOUNDARY) acceleration.z -= 0.05
            if (position.z < -BOUNDARY) acceleration.z += 0.05

            // Update Physics
            velocity.add(acceleration).clampLength(0, MAX_SPEED)
            position.add(velocity)

            // Update Instance Matrix
            dummy.position.copy(position)
            dummy.lookAt(position.clone().add(velocity))
            dummy.rotateY(Math.PI / 2) // Orient fish texture correctly if side-view
            // If texture is top-down, might need different rotation. 
            // Assuming standard side-view fish sprite.

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <planeGeometry args={[1, 0.5]} />
            <meshStandardMaterial
                map={fishTexture}
                transparent
                side={THREE.DoubleSide}
                alphaTest={0.5}
            />
        </instancedMesh>
    )
}
