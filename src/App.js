/**
 @event 1 install dependency
 #npm i face-api.js react-webcam

 @event 2 import dependencies
*/
import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";

function App() {
  /** @event 3 initialize states and refs */
  const [initializing, setInitializing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const commonStyles = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 9,
    width: 640,
    height: 480,
  };

  /** @event 4 initialize model */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${process.env.PUBLIC_URL}/models`;
      setInitializing(true);
      /** @event 8 invoke the modal data to the faceapi API */
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
    };
    /** @event 7 load all the modals */
    loadModels();
  }, []);

  /** @event 6 set stream to video object */
  const startVideo = async () => {
    navigator.mediaDevices.getUserMedia({ video: {} }, (stream) => (videoRef.current.video.srcObject = stream));
  };

  /** @event 5 loop the video */
  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (initializing) setInitializing(false);
      const webcam = videoRef.current;

      if (typeof webcam === "undefined" && webcam === null && webcam.video.readyState !== 4) return;
      webcam.innerHtml = faceapi.createCanvasFromMedia(webcam.video);
      const displaySize = { width: commonStyles.width, height: commonStyles.height };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi
        .detectAllFaces(webcam.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizeDetection = faceapi.resizeResults(detections, displaySize);

      canvasRef.current.getContext("2d").clearRect(0, 0, 0, commonStyles.width, commonStyles.height);
      faceapi.draw.drawDetections(canvasRef.current, resizeDetection);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizeDetection);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizeDetection);

      if (detections.length) console.log(detections);
    }, 100);
  };
  return (
    <div style={{ width: "100%", position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: "50%",
          zIndex: "9",
          width: "640px",
          height: "480px",
          fontSize: "1.5em",
          top: "50%",
          transform: "translate('-50%','-50%')",
        }}
      >
        {initializing ? "Initializing..." : "Ready"}
      </span>
      <Webcam ref={videoRef} onPlay={handleVideoOnPlay} style={commonStyles} />
      <canvas ref={canvasRef} style={commonStyles} />
    </div>
  );
}

export default App;
