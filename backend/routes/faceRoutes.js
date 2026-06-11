const express = require('express');
const router = express.Router();
const {
  recognizeFace,
  getAllFaceDescriptors
} = require('../controllers/faceController');

router.post('/recognize', recognizeFace);
router.get('/descriptors', getAllFaceDescriptors);

module.exports = router;