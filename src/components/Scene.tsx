import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { CylinderGeometry, Mesh, MeshBasicMaterial } from "three";
import { useRef } from "react";
import Webcam from "react-webcam";
import { Model } from "./Model";
const Scene = (props: any) => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  return (
    <>
      <Webcam
        ref={webcamRef}
        style={{
          width: 100,
          height: 100,
        }}
      />
      <canvas className="canvas-element" ref={canvasRef} />
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
            <Model
              ref={
                {
                  webcamRef: webcamRef,
                  canvasRef: canvasRef,
                } as any
              }
            />
          </PresentationControls>
        </Canvas>
      </div>
    </>
  );
};

export default Scene;
