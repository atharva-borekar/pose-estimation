import React, { useEffect, useMemo, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { partIndices } from "../constants";

tf.setBackend("webgl");

let partSet = new Set();
partSet.add("left_shoulder-left_elbow-left_wrist");
partSet.add("right_shoulder-left_shoulder-left_elbow");

// partSet.add("rightShoulder-rightElbow-rightWrist");
// partSet.add("right_elbow-right_");

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

const PoseEstimationComponent = (props: any) => {
  const { pose, setPose, setAngles } = props;
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const detector = useMemo(async () => await getModel(), []);
  const runModel = async () => {
    setInterval(() => {
      detect(detector);
    }, 50);
  };
  const drawKeypoints = (keypoints: any, ctx: any) => {
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
  };

  const drawLines = (linePairs: any, keypoints: any, ctx: any) => {
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
  };

  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

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
      setPose((poses as any)?.[0]);
      const angles = getAngles((poses as any)?.[0]);
      setAngles(angles);
      drawKeypoints((poses as any)?.[0]?.keypoints, ctx);
    }
  };

  useEffect(() => {
    runModel();
  }, []);

  return (
    <div className="w-50">
      <Webcam
        ref={webcamRef}
        style={{
          width: 100,
          height: 100,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: 100,
          height: 100,
        }}
      />
    </div>
  );
};

export default PoseEstimationComponent;
