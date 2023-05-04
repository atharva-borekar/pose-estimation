import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

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

export default function Model(props: any) {
  const { pose, angles, setAngles } = props;

  //   console.log({ pose });
  const group = useRef<any>();
  const { nodes, materials, animations, scene } = useGLTF(
    "/low_poly_humanoid_robot.glb"
  ) as any;

  const skeleton = nodes?.Object_7?.skeleton;
  const bones = skeleton?.bones;
  console.log({ bones });
  const leftUpperArm = bones?.[9];
  const leftElbow = bones?.[10];
  const rightUpperArm = bones?.[19];
  const rightElbow = bones?.[20];

  const leftThigh = bones?.[28];
  const rightThigh = bones?.[33];

  const leftCalf = bones?.[29];
  const rightCalf = bones?.[34];

  useFrame((state, delta) => {
    if (leftUpperArm) {
      leftUpperArm.rotation.y =
        ((-angles["right_shoulder-left_shoulder-left_elbow"] + 180) * Math.PI) /
        180;
    }
    if (leftElbow) {
      leftElbow.rotation.y =
        ((-angles["left_shoulder-left_elbow-left_wrist"] + 180) * Math.PI) /
        180;
    }
    if (rightUpperArm) {
      rightUpperArm.rotation.y =
        ((-angles["left_shoulder-right_shoulder-right_elbow"] + 180) *
          Math.PI) /
        180;
    }
    if (rightElbow) {
      rightElbow.rotation.y =
        ((-angles["right_shoulder-right_elbow-right_wrist"] + 180) * Math.PI) /
        180;
    }
    if (leftThigh) {
      leftThigh.rotation.y =
        ((-angles["left_shoulder-left_hip-left_knee"] + 180) * Math.PI) / 180;
    }
    if (rightThigh) {
      rightThigh.rotation.y =
        ((-angles["right_shoulder-right_hip-right_knee"] + 180) * Math.PI) /
        180;
    }
    if (leftCalf) {
      leftCalf.rotation.y =
        ((angles["left_hip-left_knee-left_ankle"] + 180) * Math.PI) / 180;
    }
    if (rightCalf) {
      rightCalf.rotation.y =
        ((angles["right_hip-right_knee-right_ankle"] + 180) * Math.PI) / 180;
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
