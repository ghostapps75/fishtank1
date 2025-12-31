import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { FishFlock } from './components/FishFlock'
import { Aquarium } from './components/Aquarium'

function App() {
  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <Environment background files="/images/ocean.png" />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={20} />

        {/* Placeholder Ambient Light */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />


        <Aquarium />
        <FishFlock />
      </Canvas>
    </div>
  )
}

export default App
