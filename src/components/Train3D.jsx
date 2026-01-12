import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { config } from '../config'

function TrainModel({ url }) {
  const { scene } = useGLTF(url)
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      // subtle bob + forward motion simulation
      ref.current.rotation.y += delta * 0.1
      ref.current.position.x = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return <primitive ref={ref} object={scene} dispose={null} />
}

export default function Train3D({ modelUrl, size = 240 }) {
  // Option A: prefer env-provided CDN URL, else fall back to local public/models/train.glb
  const src = modelUrl || config.trainModelUrl || '/models/train.glb'

  return (
    <div className="train3d-card p-2 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Running Train</h4>
        <div className="text-xs text-gray-500">Created by Shashi Shekhar Mishra</div>
      </div>

      <div style={{ width: size, height: size }} className="mx-auto">
        <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading 3D model...</div>}>
          <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <Suspense>
              <TrainModel url={src} />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} />
            <Environment preset="warehouse" />
          </Canvas>
        </Suspense>
      </div>

      <div className="mt-2 text-xs text-gray-600">Tip: Using Option A (CDN-hosted model). To embed the model in repo (Option B), place a glTF/GLB at <code>/public/models/train.glb</code> or set <code>VITE_TRAIN_MODEL_URL</code> to a CDN link.</div>
    </div>
  )
}
