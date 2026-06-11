import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import toast from 'react-hot-toast';

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
      setModelsLoaded(true);
      toast.success('Face recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load face recognition models');
    }
  };

  const captureAndRecognize = async () => {
  setLoading(true);
  
  try {
    const imageSrc = webcamRef.current.getScreenshot();
    const image = await faceapi.fetchImage(imageSrc);
    
    const detections = await faceapi.detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      toast.error('No face detected');
      setLoading(false);
      return;
    }

    // This is already an array - ensure it's sent correctly
    const faceDescriptor = Array.from(detections.descriptor);
    
    console.log('Sending face descriptor (array length):', faceDescriptor.length);
    
    const response = await axios.post('http://localhost:5000/api/face/recognize', { 
      faceDescriptor: faceDescriptor  // Send as array, not string
    });
    
    if (response.data.success) {
      toast.success(`Welcome ${response.data.employee.name}!`);
      // Mark attendance
      await axios.post('http://localhost:5000/api/attendance/mark', {
        employeeId: response.data.employee.id,
        faceRecognized: true,
        recognitionConfidence: response.data.confidence
      });
    }
  } catch (error) {
    console.error('Recognition error:', error);
    toast.error(error.response?.data?.message || 'Face recognition failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="webcam-container">
      <h2>Face Recognition Attendance</h2>
      <p>Position your face in front of the camera and click the button</p>
      
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam"
        width={640}
        height={480}
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />
      
      <div className="button-group">
        <button 
          onClick={captureAndRecognize} 
          disabled={loading || !modelsLoaded}
        >
          {loading ? 'Recognizing...' : 'Mark Attendance'}
        </button>
      </div>
      
      {recognitionResult && (
        <div className={`recognition-result ${recognitionResult.success ? 'success' : 'error'}`}>
          {recognitionResult.success ? (
            <div>
              <h3>Welcome, {recognitionResult.employee.name}!</h3>
              <p>Employee ID: {recognitionResult.employee.employeeId}</p>
              <p>Department: {recognitionResult.employee.department}</p>
              <p>Confidence: {recognitionResult.confidence}%</p>
            </div>
          ) : (
            <div>
              <h3>Recognition Failed</h3>
              <p>{recognitionResult.message}</p>
            </div>
          )}
        </div>
      )}
      
      {!modelsLoaded && (
        <p className="loading-message">Loading face recognition models...</p>
      )}
    </div>
  );
};

export default FaceRecognition;