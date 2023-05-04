import React, { useRef, useState } from "react";
import "./App.css";
import PoseEstimationComponent from "./components/PoseEstimation";
// import Scene from "./components/Scene";
import { Col, Row } from "react-bootstrap";
import Scene from "./components/Scene";

function App() {
  const [pose, setPose] = useState<any>(null);
  const [angles, setAngles] = useState<any>({});
  console.log({ angles });
  return (
    <div className="App">
      <Row className="d-flex flex-1">
        <PoseEstimationComponent
          pose={pose}
          setPose={setPose}
          setAngles={setAngles}
        />
        <Scene pose={pose} setPose={setPose} angles={angles} />
      </Row>
    </div>
  );
}

export default App;
