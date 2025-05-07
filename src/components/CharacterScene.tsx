import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { LipSyncController } from '../utils/lipSync';

const lipSync = new LipSyncController();

function Character({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  
  useEffect(() => {
    if (modelRef.current) {
      lipSync.setModel(modelRef.current);
    }
  }, []);

  scene.traverse((node: any) => {
    if (node.isMesh) {
      node.material.metalness = 0.3;
      node.material.roughness = 0.7;
      node.material.envMapIntensity = 1.5;
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  
  return <primitive ref={modelRef} object={scene} scale={1.2} position={[0, -1.5, 0]} />;
}

export const CharacterScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
          <Center>
            <Character url="/models/character.glb" />
          </Center>
          <Environment preset="studio" intensity={1.2} />
        </Suspense>
        <OrbitControls 
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          enablePan={false}
          maxDistance={8}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}

export { lipSync };