import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { partSet } from "./PoseEstimation";

const posenetPartIndex = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
};

const arr: Array<string> = [...partSet];
const initialValues: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const anglesHistory: any = {};
arr.map((e: string) => {
  anglesHistory[e] = [...initialValues];
  return null;
});

const updateAngles = (angles: any) => {
  angles &&
    Object.entries(angles)?.map(([key, value]: any) => {
      if (anglesHistory[key]?.length > 10) anglesHistory?.[key]?.shift();
      anglesHistory?.[key]?.push(value);
      return null;
    });
};

const getAverage = (angleElement: string) => {
  const sum = anglesHistory?.[angleElement]?.reduce(
    (a: number, b: number) => a + b,
    0
  );
  const avg = sum / anglesHistory?.[angleElement]?.length;
  return avg;
};

export default function Model(props: any) {
  const { pose, angles, setAngles } = props;

  const group = useRef<any>();
  const { nodes, materials, animations, scene } = useGLTF(
    "/low_poly_humanoid_robot.glb"
  ) as any;

  updateAngles(angles);
  const skeleton = nodes?.Object_7?.skeleton;
  const bones = skeleton?.bones;
  const leftUpperArm = bones?.[9];
  const leftElbow = bones?.[10];
  const rightUpperArm = bones?.[19];
  const rightElbow = bones?.[20];

  const leftThigh = bones?.[28];
  const rightThigh = bones?.[33];

  const leftCalf = bones?.[29];
  const rightCalf = bones?.[34];
  const leftHand = bones?.[11];
  const rightHand = bones?.[21];

  useFrame((state, delta) => {
    if (leftUpperArm) {
      leftUpperArm.rotation.y =
        ((-getAverage("right_shoulder-left_shoulder-left_elbow") + 180) *
          Math.PI) /
        180;
    }
    if (leftElbow) {
      leftElbow.rotation.y =
        ((-getAverage("left_shoulder-left_elbow-left_wrist") + 180) * Math.PI) /
        180;
    }
    if (rightUpperArm) {
      rightUpperArm.rotation.y =
        ((-getAverage("left_shoulder-right_shoulder-right_elbow") + 180) *
          Math.PI) /
        180;
    }
    if (rightElbow) {
      rightElbow.rotation.y =
        ((-getAverage("right_shoulder-right_elbow-right_wrist") + 180) *
          Math.PI) /
        180;
    }
    if (leftThigh) {
      leftThigh.rotation.y =
        ((-getAverage("left_shoulder-left_hip-left_knee") + 180) * Math.PI) /
        180;
    }
    if (rightThigh) {
      rightThigh.rotation.y =
        ((-getAverage("right_shoulder-right_hip-right_knee") + 180) * Math.PI) /
        180;
    }
    if (leftCalf) {
      leftCalf.rotation.y =
        ((getAverage("left_hip-left_knee-left_ankle") + 180) * Math.PI) / 180;
    }
    if (rightCalf) {
      rightCalf.rotation.y =
        ((getAverage("right_hip-right_knee-right_ankle") + 180) * Math.PI) /
        180;
    }
    if (leftHand) {
      leftHand.rotation.z =
        (-(getAverage("left_elbow-left_wrist-left_index") + 180) * Math.PI) /
        180;
    }
    if (rightHand) {
      rightHand.rotation.z =
        ((getAverage("right_elbow-right_wrist-right_index") + 180) * Math.PI) /
        180;
    }
  });

  return (
    <group ref={group} {...props} dispose={null} position={[0, -5, 0]}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="LowPolyRobotfbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.1}
          >
            <group name="Object_4">
              <primitive object={nodes._rootJoint} />

              <skinnedMesh
                name="Object_7"
                geometry={nodes.Object_7.geometry}
                material={materials.lpRobot}
                skeleton={nodes.Object_7.skeleton}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
