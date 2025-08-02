import express from 'express';
import multer from 'multer';
import { scanFile, getScanStatus, testApiKey, customScanFile } from '../controllers/fileScanner.js';

const router = express.Router();

// Configure multer for file uploads with temporary storage
// Files are stored in /tmp/ directory and cleaned up after processing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/') // Temporary directory for file processing
  },
  filename: function (req, file, cb) {
    // Generate unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// Configure multer with file size limits and validation
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 32 * 1024 * 1024 // 32MB limit for VirusTotal API compatibility
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for comprehensive scanning
    cb(null, true);
  }
});

// File scanning endpoints
router.post('/scan', upload.single('file'), scanFile); // VirusTotal API scanning
router.post('/custom-scan', upload.single('file'), customScanFile); // Local analysis scanning
router.get('/status/:hash', getScanStatus); // Check scan status for uploaded files
router.get('/test-api', testApiKey); // Test VirusTotal API key functionality

export default router; 