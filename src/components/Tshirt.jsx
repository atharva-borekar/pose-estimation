import { useGLTF } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { Euler } from "three";

export default function Tshirt(props) {
  const { angles } = props;
  const [ref] = useBox(() => ({
    mass: 10,
    // position: [0, 0, 0],
    ...props,
  }));
  const { nodes, materials } = useGLTF("/tshirt.glb");
  const mesh3 = nodes?.Cloth_mesh_3;
  const mesh9 = nodes?.Cloth_mesh_9;
  const mesh15 = nodes?.Cloth_mesh_15;
  const mesh24 = nodes?.Cloth_mesh_24;

  useFrame(() => {
    if (mesh24) {
      mesh24.rotation = new Euler(30, 30, 30);
    }
    // if (leftHand) {
    //   leftHand.rotation.x = Math.PI;
    // }
    // if (rightHand) {
    //   rightHand.rotation.x = Math.PI;
    // }
    // if (leftUpperArm) {
    //   leftUpperArm.rotation.y =
    //     ((-getAverage("right_shoulder-left_shoulder-left_elbow") + 180) *
    //       Math.PI) /
    //     180;
    // }
    // if (leftElbow) {
    //   leftElbow.rotation.y =
    //     ((-getAverage("left_shoulder-left_elbow-left_wrist") + 180) * Math.PI) /
    //     180;
    // }
    // if (rightUpperArm) {
    //   rightUpperArm.rotation.y =
    //     ((-getAverage("left_shoulder-right_shoulder-right_elbow") + 180) *
    //       Math.PI) /
    //     180;
    // }
    // if (rightElbow) {
    //   rightElbow.rotation.y =
    //     ((-getAverage("right_shoulder-right_elbow-right_wrist") + 180) *
    //       Math.PI) /
    //     180;
    // }
    // if (leftThigh) {
    //   leftThigh.rotation.y =
    //     ((-getAverage("left_shoulder-left_hip-left_knee") + 180) * Math.PI) /
    //     180;
    // }
    // if (rightThigh) {
    //   rightThigh.rotation.y =
    //     ((-getAverage("right_shoulder-right_hip-right_knee") + 180) * Math.PI) /
    //     180;
    // }
    // if (leftCalf) {
    //   leftCalf.rotation.y =
    //     ((getAverage("left_hip-left_knee-left_ankle") + 180) * Math.PI) / 180;
    // }
    // if (rightCalf) {
    //   rightCalf.rotation.y =
    //     ((getAverage("right_hip-right_knee-right_ankle") + 180) * Math.PI) /
    //     180;
    // }
    // if (pelvis) {
    //   pelvis.rotation.y = ((getAverage("pelvis-xy") - 90) * Math.PI) / 180;
    //   // pelvis.rotation.x = (getAverage("pelvis-zx") * Math.PI) / 180;
    //   if (
    //     ((getAverage("pelvis-xy") - 90) * Math.PI) / 180 > 0.25 ||
    //     ((getAverage("pelvis-xy") - 90) * Math.PI) / 180 < -0.25
    //   ) {
    //     leftThigh.rotation.y = -0.1;
    //     rightThigh.rotation.y = 0.1;
    //   }
    // }
    // if (head) {
    //   head.rotation.y = ((getAverage("pelvis-xy") - 90) * Math.PI) / 180;
    // }
  });
  return (
    <group ref={ref} scale={[9, 9, 9]} {...props} dispose={null}>
      <mesh
        geometry={nodes.Cloth_mesh_3.geometry}
        material={materials["FABRIC 1_FRONT_2458"]}
      />

      <mesh
        geometry={nodes.Cloth_mesh_9.geometry}
        material={materials["FABRIC 1_FRONT_2458"]}
      />

      <mesh
        geometry={nodes.Cloth_mesh_15.geometry}
        material={materials["FABRIC 1_FRONT_2458"]}
      />

      <mesh
        geometry={nodes.Cloth_mesh_24.geometry}
        material={materials["FABRIC 1_FRONT_2458"]}
      />
    </group>
  );
}

useGLTF.preload("/tshirt.glb");
