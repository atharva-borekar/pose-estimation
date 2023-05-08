import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useCallback, useMemo, useRef } from "react";
import { partIndices } from "../constants";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import Webcam from "react-webcam";

tf.setBackend("webgl");

let partSet = new Set<string>();
partSet.add("left_shoulder-left_elbow-left_wrist");
partSet.add("right_shoulder-left_shoulder-left_elbow");

partSet.add("right_shoulder-right_elbow-right_wrist");
partSet.add("left_shoulder-right_shoulder-right_elbow");

partSet.add("left_shoulder-left_hip-left_knee");
partSet.add("right_shoulder-right_hip-right_knee");

partSet.add("left_hip-left_knee-left_ankle");
partSet.add("right_hip-right_knee-right_ankle");

partSet.add("left_elbow-left_wrist-left_index");
partSet.add("right_elbow-right_wrist-right_index");

partSet.add("pelvis-xy");
partSet.add("pelvis-yz");
partSet.add("pelvis-zx");
export { partSet };

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

const getDirectAngle = (
  start: any,
  end: any,
  firstAxis: string,
  secondAxis: string
) =>
  (Math.atan2(
    start?.[firstAxis] - end?.[firstAxis],
    start?.[secondAxis] - end?.[secondAxis]
  ) *
    180) /
  Math.PI;

const partIndexes = Object.keys(partIndices);
function getAngles(pose: any) {
  const keypoints = pose.keypoints;
  const angles: any = {};

  for (let i = 0; i < keypoints.length; i++) {
    for (let j = 0; j < keypoints.length; j++) {
      for (let k = 0; k < keypoints.length; k++) {
        if (
          partSet.has(
            partIndexes[i] + "-" + partIndexes[j] + "-" + partIndexes[k]
          )
        ) {
          const a = keypoints[i];
          const b = keypoints[j];
          const c = keypoints[k];

          angles[`${partIndexes[i]}-${partIndexes[j]}-${partIndexes[k]}`] =
            angleBetweenLines(a?.x, a?.y, b?.x, b?.y, c?.x, c?.y);
        }
      }
    }
  }
  if (partSet.has("pelvis-xy")) {
    const leftShoulder = pose?.keypoints3D?.[11];
    const rightShoulder = pose?.keypoints3D?.[12];

    angles["pelvis-xy"] = getDirectAngle(leftShoulder, rightShoulder, "x", "y");
    angles["pelvis-yz"] = getDirectAngle(leftShoulder, rightShoulder, "y", "z");
    angles["pelvis-zx"] = getDirectAngle(leftShoulder, rightShoulder, "z", "x");
  }

  return angles;
}

function angleBetweenLines(
  x1: any,
  y1: any,
  x2: any,
  y2: any,
  x3: any,
  y3: any
) {
  // Calculate the vectors representing the two lines
  const vec1 = [x1 - x2, y1 - y2];
  const vec2 = [x3 - x2, y3 - y2];

  // Calculate the dot product of the vectors
  const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1];

  // Calculate the lengths of the vectors
  const length1 = Math.sqrt(vec1[0] ** 2 + vec1[1] ** 2);
  const length2 = Math.sqrt(vec2[0] ** 2 + vec2[1] ** 2);

  // Calculate the angle between the vectors in radians
  const angle = Math.acos(dotProduct / (length1 * length2));

  // Convert the angle to degrees
  const angleDegrees = (angle * 180) / Math.PI;

  // Determine the clockwise angle between the lines
  const det = vec1[0] * vec2[1] - vec1[1] * vec2[0];
  if (det > 0) {
    return 360 - angleDegrees;
  } else {
    return angleDegrees;
  }
}
const getModel = async () => {
  const model = await poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "tfjs",
    enableSmoothing: true,
    modelType: "full",
  };
  const detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
};

export const Model = forwardRef((props: any, ref: any) => {
  const { webcamRef, canvasRef } = ref;

  const detector = useMemo(async () => await getModel(), []);
  const drawLines = useCallback((linePairs: any, keypoints: any, ctx: any) => {
    linePairs.forEach(([start, end]: any) => {
      const startKeypoint = keypoints[start];
      const endKeypoint = keypoints[end];
      ctx.beginPath();
      ctx.moveTo(startKeypoint?.x, startKeypoint.y);
      ctx.lineTo(endKeypoint?.x, endKeypoint.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "red";
      ctx.stroke();
    });
  }, []);
  const drawKeypoints = useCallback(
    (keypoints: any, ctx: any) => {
      console.log({ keypoints, ctx });
      for (let i = 0; i < keypoints?.length; i++) {
        const keypoint = keypoints?.[i];
        const { y, x } = keypoint;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }
      drawLines(
        [
          [partIndices.right_wrist, partIndices.right_elbow],
          [partIndices.right_elbow, partIndices.right_shoulder],
          [partIndices.right_shoulder, partIndices.left_shoulder],
          [partIndices.left_shoulder, partIndices.left_elbow],
          [partIndices.left_elbow, partIndices.left_wrist],
          [partIndices.right_shoulder, partIndices.right_hip],
          [partIndices.left_shoulder, partIndices.left_hip],
          [partIndices.right_hip, partIndices.left_hip],
          [partIndices.right_hip, partIndices.right_knee],
          [partIndices.left_hip, partIndices.left_knee],
          [partIndices.right_knee, partIndices.right_ankle],
          [partIndices.left_knee, partIndices.left_ankle],
        ],
        keypoints,
        ctx
      );
    },
    [drawLines]
  );
  const detect = useCallback(
    async (net: any) => {
      if (
        typeof webcamRef?.current !== "undefined" &&
        webcamRef?.current !== null &&
        webcamRef?.current.video.readyState === 4
      ) {
        const video = webcamRef?.current.video;
        const videoWidth = webcamRef?.current.video.videoWidth;
        const videoHeight = webcamRef?.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        //detect pose here
        const estimationConfig = { flipHorizontal: true };
        const timestamp = performance.now();
        const poses = await (
          await detector
        )?.estimatePoses(video, estimationConfig, timestamp);
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        const angles = getAngles((poses as any)?.[0]);
        updateAngles(angles);
        console.log({ poses, angles });
        drawKeypoints((poses as any)?.[0]?.keypoints, ctx);
        return { poses, angles };
      }
    },
    [detector, drawKeypoints, canvasRef, webcamRef]
  );

  const group = useRef<any>();
  const { nodes, materials } = useGLTF("/low_poly_humanoid_robot.glb") as any;

  // updateAngles(angles);
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

  useFrame(async (state, delta) => {
    detect(getModel());
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
});
