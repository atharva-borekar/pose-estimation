import { useState } from "react";
import "./App.css";
// import Scene from "./components/Scene";
import { Col, Row } from "react-bootstrap";
import PoseEstimationComponent from "./components/PoseEstimation";
import Scene from "./components/Scene";

function App() {
  const [pose, setPose] = useState<any>(null);
  const [angles, setAngles] = useState<any>({});

  return (
    <div className="App">
      <Row className="d-flex flex-1">
        <Col>
          <Scene pose={pose} setPose={setPose} angles={angles} />
        </Col>
        <Col>
          <PoseEstimationComponent
            pose={pose}
            setPose={setPose}
            setAngles={setAngles}
          />
        </Col>
      </Row>
    </div>
  );
}

export default App;
