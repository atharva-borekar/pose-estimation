import { useGLTF } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { memo, useRef } from "react";
import { partSet } from "./PoseEstimation";

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

const Model = (props: any) => {
  const [ref] = useBox(() => ({ mass: 10, position: [0, 5, 0], ...props }));
  const { angles } = props;

  const { nodes, materials } = useGLTF("/low_poly_humanoid_robot.glb") as any;

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
  const pelvis = bones?.[3];

  const head = bones?.[5];
  const leftHand = bones?.[11];
  const rightHand = bones?.[21];

  useFrame((state, delta) => {
    if (leftHand) {
      leftHand.rotation.x = Math.PI;
    }
    if (rightHand) {
      rightHand.rotation.x = Math.PI;
    }
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
    if (pelvis) {
      pelvis.rotation.y = ((getAverage("pelvis-xy") - 90) * Math.PI) / 180;
      // pelvis.rotation.x = (getAverage("pelvis-zx") * Math.PI) / 180;
      if (
        ((getAverage("pelvis-xy") - 90) * Math.PI) / 180 > 0.25 ||
        ((getAverage("pelvis-xy") - 90) * Math.PI) / 180 < -0.25
      ) {
        leftThigh.rotation.y = -0.1;
        rightThigh.rotation.y = 0.1;
      }
    }
    if (head) {
      head.rotation.y = ((getAverage("pelvis-xy") - 90) * Math.PI) / 180;
    }
  });

  return (
    <group ref={ref} {...props} dispose={null} position={[0, 0, 0]}>
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
};

export default memo(Model);
