import { useGLTF } from "@react-three/drei";

export function Computer(props) {
  const { nodes, materials } = useGLTF("/models/laptop_desk.glb");

  // Check if the model has loaded properly
  if (!nodes || !materials) return null;

  // Find the main computer/desk node - adjust based on your actual node names
  const computerNode =
    nodes.RootNode || nodes.Sketchfab_model || nodes.Sketchfab_Scene;

  return (
    <group {...props} dispose={null}>
      <group position={[-4.005, 67.549, 58.539]}>
        {computerNode ? (
          <primitive object={computerNode} />
        ) : (
          // Fallback if no nodes are found
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        )}
      </group>
    </group>
  );
}

useGLTF.preload("/models/laptop_desk.glb");

export default Computer;
