import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { CylinderGeometry, Mesh, MeshBasicMaterial } from "three";
import Model from "./Model";
const Scene = (props: any) => {
  const { pose, setPose, angles } = props;

  return (
    <div id="canvas-container">
      <Canvas
        style={{
          height: "98vh",
          background: "#171717",
        }}
        camera={{ position: [0, 0, 20] }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight color="white" position={[0, 0, 5]} />
        <PresentationControls>
          <Model pose={pose} angles={angles} />
        </PresentationControls>
      </Canvas>
    </div>
  );
};

export default Scene;
