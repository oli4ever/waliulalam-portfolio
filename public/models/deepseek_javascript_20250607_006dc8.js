export function Computer(props) {
  const { nodes, materials } = useGLTF("/models/laptop_desk.glb");
  
  // Temporarily add this to see the actual structure
  console.log("Nodes:", nodes);
  console.log("Materials:", materials);
  
  // Rest of your component...
}