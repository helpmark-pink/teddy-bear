import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { LipSyncController } from '../utils/lipSync';
import * as THREE from 'three';

const lipSync = new LipSyncController();

// THREE.Object3Dを拡張したインターフェースを修正
interface MeshWithMaterial extends THREE.Object3D {
  isMesh?: boolean;
  material?: THREE.Material & {
    metalness?: number;
    roughness?: number;
    envMapIntensity?: number;
  };
}

function Character({ url, scale }: { url: string, scale: number }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group | null>(null);
  
  useEffect(() => {
    if (modelRef.current) {
      lipSync.setModel(modelRef.current);
    }
  }, []);

  scene.traverse((node: THREE.Object3D) => {
    if ((node as any).isMesh) {
      const mesh = node as THREE.Mesh;
      if (mesh.material) {
        const material = mesh.material as THREE.Material & {
          metalness?: number;
          roughness?: number;
          envMapIntensity?: number;
        };
        
        if (material) {
          material.metalness = 0.3;
          material.roughness = 0.7;
          material.envMapIntensity = 1.5;
        }
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  
  return <primitive ref={modelRef} object={scene} scale={scale} position={[0, -1.5, 0]} />;
}

export const CharacterScene: React.FC = () => {
  // 画面サイズに応じてスケールとカメラ設定を調整
  const [modelScale, setModelScale] = useState(1.2);
  const [cameraFov, setCameraFov] = useState(45);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 6]);

  // 画面サイズに応じた設定を更新
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      // 小さな画面 (スマートフォンなど)
      if (width <= 375) {
        setModelScale(0.9);
        setCameraFov(50);
        setCameraPosition([0, -0.5, 5.5]);
      } 
      // iPhone 16 や中型画面
      else if (width <= 428) {
        setModelScale(1.1);
        setCameraFov(48);
        setCameraPosition([0, -0.3, 5.8]);
      }
      // 大型スマホ（6.3インチなど）
      else if (width <= 510) {
        setModelScale(1.15);
        setCameraFov(46);
        setCameraPosition([0, -0.2, 5.9]);
      }
      // 横長の画面
      else if (aspectRatio > 1.5) {
        setModelScale(1.2);
        setCameraFov(42);
        setCameraPosition([0, 0, 6]);
      } 
      // 大型画面
      else {
        setModelScale(1.3);
        setCameraFov(45);
        setCameraPosition([0, 0, 6]);
      }
    };

    // 初期化時と画面サイズ変更時に実行
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
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
            <Character url="/models/character.glb" scale={modelScale} />
          </Center>
          <Environment preset="studio" background={false} />
        </Suspense>
        <OrbitControls 
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
          enableZoom={false}
          enableRotate={false} // 回転を完全に無効化
          autoRotate={false} // 自動回転も無効化
        />
      </Canvas>
    </div>
  );
}

export { lipSync };