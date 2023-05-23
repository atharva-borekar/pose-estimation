import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import { CylinderGeometry, Mesh, MeshBasicMaterial } from "three";
import Model from "./Model";
import Tshirt from "./Tshirt";
import { memo } from "react";

function Plane(props: any) {
  const [ref]: any = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
    </mesh>
  );
}

const Scene = (props: any) => {
  const { pose, setPose, angles } = props;
  console.log({ pose });
  const palm = pose?.palmBase?.[0];

  return (
    <div id="canvas-container">
      <Canvas
        style={{
          height: "98vh",
          background: "#171717",
        }}
        camera={{ position: [0, 10, 20] }}
      >
        <Physics gravity={[0, -30, 0]}>
          <ambientLight intensity={0.5} />
          <directionalLight color="white" position={[0, 0, 2]} />
          <PresentationControls>
            <Plane position={[0, -10, 0]} />
            {/* <Tshirt pose={pose} angles={angles} /> */}
            {/* <Model pose={pose} angles={angles} /> */}
            <mesh position={[palm?.[0] / 50, palm?.[1] / 50, palm?.[2] / 50]}>
              <sphereGeometry args={[5, 24, 24]} />
              <meshStandardMaterial color={"blue"} />
            </mesh>
          </PresentationControls>
        </Physics>
      </Canvas>
    </div>
  );
};

export default memo(Scene);
