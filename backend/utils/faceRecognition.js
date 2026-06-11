const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs');

// Configure face-api.js to use canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face recognition models
let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;
  
  const modelsPath = path.join(__dirname, '../models');
  
  // Create models directory if it doesn't exist
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath, { recursive: true });
  }
  
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Error loading face models:', error);
    throw error;
  }
};

// Extract face descriptor from image
const extractFaceDescriptor = async (imagePath) => {
  await loadModels();
  
  try {
    // Read image
    const img = await canvas.loadImage(imagePath);
    
    // Detect face and get descriptor
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      throw new Error('No face detected in the image');
    }
    
    return {
      descriptor: Array.from(detection.descriptor),
      detection: detection
    };
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    throw error;
  }
};

// Compare two face descriptors
const compareFaces = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Invalid face descriptors');
  }
  
  // Calculate Euclidean distance
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  distance = Math.sqrt(distance);
  
  // Return similarity percentage (0-100)
  const similarity = Math.max(0, Math.min(100, (1 - distance) * 100));
  
  return {
    distance,
    similarity: Math.round(similarity),
    isMatch: distance < 0.6 // Threshold for match
  };
};

// Find best matching employee from list
const findBestMatch = (faceDescriptor, employees) => {
  let bestMatch = null;
  let bestDistance = Infinity;
  let bestSimilarity = 0;
  
  for (const employee of employees) {
    if (employee.faceDescriptor && employee.faceDescriptor.length > 0) {
      const comparison = compareFaces(faceDescriptor, employee.faceDescriptor);
      
      if (comparison.distance < bestDistance && comparison.isMatch) {
        bestDistance = comparison.distance;
        bestSimilarity = comparison.similarity;
        bestMatch = employee;
      }
    }
  }
  
  return bestMatch ? {
    employee: bestMatch,
    distance: bestDistance,
    similarity: bestSimilarity
  } : null;
};

// Validate image quality for face recognition
const validateFaceImage = async (imagePath) => {
  await loadModels();
  
  try {
    const img = await canvas.loadImage(imagePath);
    const detection = await faceapi.detectSingleFace(img);
    
    if (!detection) {
      return {
        isValid: false,
        message: 'No face detected in the image'
      };
    }
    
    // Check face size (should be at least 80x80 pixels)
    const faceSize = detection.box.width * detection.box.height;
    if (faceSize < 6400) { // 80x80
      return {
        isValid: false,
        message: 'Face is too small. Please move closer to the camera'
      };
    }
    
    // Check face position (should be reasonably centered)
    const imgWidth = img.width;
    const imgHeight = img.height;
    const faceCenter = {
      x: detection.box.x + detection.box.width / 2,
      y: detection.box.y + detection.box.height / 2
    };
    
    const isCentered = Math.abs(faceCenter.x - imgWidth / 2) < imgWidth / 4 &&
                      Math.abs(faceCenter.y - imgHeight / 2) < imgHeight / 4;
    
    if (!isCentered) {
      return {
        isValid: false,
        message: 'Please center your face in the frame'
      };
    }
    
    return {
      isValid: true,
      message: 'Face image is valid',
      detection
    };
  } catch (error) {
    console.error('Error validating face image:', error);
    throw error;
  }
};

// Batch process multiple face images
const batchProcessFaces = async (imagePaths) => {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      const result = await extractFaceDescriptor(imagePath);
      results.push({
        path: imagePath,
        success: true,
        descriptor: result.descriptor
      });
    } catch (error) {
      results.push({
        path: imagePath,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

module.exports = {
  loadModels,
  extractFaceDescriptor,
  compareFaces,
  findBestMatch,
  validateFaceImage,
  batchProcessFaces
};