import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import Computer from "./Computer";

const CameraController = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

const ContactExperience = () => {
  return (
    <Canvas shadows>
      <CameraController />
      <ambientLight intensity={0.5} color="#fff4e6" />
      <directionalLight position={[5, 5, 3]} intensity={2.5} color="#ffd9b3" />
      <directionalLight
        position={[5, 9, 1]}
        castShadow
        intensity={2.5}
        color="#ffd9b3"
      />

      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#a46b2d" />
      </mesh>

      {/* Computer - adjusted scale and position */}
      <group scale={0.015} position={[0, -1.5, 0]}>
        <Computer />
      </group>
    </Canvas>
  );
};

export default ContactExperience;
