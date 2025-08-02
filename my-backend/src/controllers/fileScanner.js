import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scan file using VirusTotal API
 * First checks if file hash exists in VirusTotal database
 * If not found, uploads file for scanning
 * Returns comprehensive scan results with threat detection
 */
export async function scanFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!virusTotalApiKey) {
      return res.status(500).json({ 
        error: 'VirusTotal API key not configured',
        message: 'Please configure VIRUSTOTAL_API_KEY in environment variables'
      });
    }

    // Check if API key is enabled for uploads
    const uploadTestResponse = await fetch('https://www.virustotal.com/vtapi/v2/file/scan', {
      method: 'POST',
      headers: {
        'x-apikey': virusTotalApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'resource=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timeout: 10000
    });

    if (uploadTestResponse.status === 403) {
      return res.status(500).json({ 
        error: 'VirusTotal API key is disabled for uploads',
        message: 'Your API key does not have upload permissions. Please get a new API key or upgrade your account.',
        solution: 'Visit https://www.virustotal.com/gui/join-us to get a new API key'
      });
    }

    // Validate file size (32MB limit for VirusTotal)
    const maxFileSize = 32 * 1024 * 1024;
    if (req.file.size > maxFileSize) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'File size exceeds 32MB limit' });
    }

    // Calculate file hash for VirusTotal lookup
    const fileBuffer = fs.readFileSync(req.file.path);
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // First, try to get existing report from VirusTotal
    const reportUrl = `https://www.virustotal.com/vtapi/v2/file/report`;
    const reportParams = new URLSearchParams({
      apikey: virusTotalApiKey,
      resource: fileHash
    });

    const reportResponse = await fetch(`${reportUrl}?${reportParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SecurityWeb-FileScanner/1.0'
      },
      timeout: 30000
    });

    let scanResult = null;

    if (reportResponse.ok) {
      const reportData = await reportResponse.json();
      
      if (reportData.response_code === 1) {
        // File already exists in VirusTotal database
        scanResult = {
          type: 'existing_report',
          hash: fileHash,
          filename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          positives: reportData.positives || 0,
          total: reportData.total || 0,
          scanDate: reportData.scan_date,
          permalink: reportData.permalink,
          scans: reportData.scans || {},
          analyzedAt: new Date().toISOString()
        };
      }
    }

    // If no existing report, upload the file to VirusTotal
    if (!scanResult) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path));
      
      const uploadResponse = await fetch('https://www.virustotal.com/vtapi/v2/file/scan', {
        method: 'POST',
        headers: {
          'x-apikey': virusTotalApiKey,
          ...formData.getHeaders()
        },
        body: formData,
        timeout: 60000 // 60 seconds for upload
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`VirusTotal upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();

      // Wait a moment and then get the report
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalReportResponse = await fetch(`${reportUrl}?${reportParams}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SecurityWeb-FileScanner/1.0'
        },
        timeout: 30000
      });

      if (finalReportResponse.ok) {
        const finalReportData = await finalReportResponse.json();
        
        scanResult = {
          type: 'new_upload',
          hash: fileHash,
          filename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          positives: finalReportData.positives || 0,
          total: finalReportData.total || 0,
          scanDate: finalReportData.scan_date,
          permalink: finalReportData.permalink,
          scans: finalReportData.scans || {},
          uploadResult: uploadResult,
          analyzedAt: new Date().toISOString()
        };
      } else {
        // If we can't get the report immediately, return upload info
        scanResult = {
          type: 'uploaded',
          hash: fileHash,
          filename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadResult: uploadResult,
          message: 'File uploaded successfully. Report may take a few minutes to be available.',
          analyzedAt: new Date().toISOString()
        };
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json(scanResult);

  } catch (error) {
    console.error('File scan error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'File scan failed',
      details: error.message
    });
  }
}

/**
 * Test VirusTotal API key functionality
 * Verifies if the API key is valid and has proper permissions
 */
export async function testApiKey(req, res) {
  try {
    const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!virusTotalApiKey) {
      return res.status(500).json({ 
        error: 'VirusTotal API key not configured'
      });
    }

    // Test the API key with a simple request
    const testUrl = 'https://www.virustotal.com/vtapi/v2/file/report';
    const testParams = new URLSearchParams({
      apikey: virusTotalApiKey,
      resource: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // SHA256 of empty file
    });

    const response = await fetch(`${testUrl}?${testParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SecurityWeb-FileScanner/1.0'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      res.json({
        status: 'success',
        message: 'API key is working correctly',
        responseCode: response.status
      });
    } else if (response.status === 403) {
      res.json({
        status: 'error',
        message: 'API key is invalid or has insufficient permissions',
        responseCode: response.status
      });
    } else {
      const errorText = await response.text();
      res.json({
        status: 'error',
        message: `API test failed: ${response.status} ${response.statusText}`,
        responseCode: response.status,
        error: errorText
      });
    }

  } catch (error) {
    console.error('API key test error:', error);
    res.status(500).json({ 
      error: 'Failed to test API key',
      details: error.message
    });
  }
}

/**
 * Get scan status for a previously uploaded file
 * Checks if scan results are available for a given file hash
 */
export async function getScanStatus(req, res) {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'File hash is required' });
    }

    const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!virusTotalApiKey) {
      return res.status(500).json({ 
        error: 'VirusTotal API key not configured'
      });
    }

    const reportUrl = `https://www.virustotal.com/vtapi/v2/file/report`;
    const reportParams = new URLSearchParams({
      apikey: virusTotalApiKey,
      resource: hash
    });

    const response = await fetch(`${reportUrl}?${reportParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SecurityWeb-FileScanner/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.response_code === 1) {
      res.json({
        status: 'completed',
        hash: hash,
        positives: data.positives || 0,
        total: data.total || 0,
        scanDate: data.scan_date,
        permalink: data.permalink,
        scans: data.scans || {}
      });
    } else {
      res.json({
        status: 'pending',
        hash: hash,
        message: 'Scan is still in progress'
      });
    }

  } catch (error) {
    console.error('Scan status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check scan status',
      details: error.message
    });
  }
} 

/**
 * Custom file scanner that performs local analysis
 * Does not rely on external APIs, provides basic security analysis
 * Includes entropy analysis, string extraction, and threat detection
 */
export async function customScanFile(req, res) {
  console.log('Custom scan request received');
  console.log('Request headers:', req.headers);
  console.log('Request file:', req.file);
  
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('File received:', req.file.originalname, req.file.size, req.file.mimetype);
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Read file content and calculate hashes
    const fileBuffer = fs.readFileSync(filePath);
    const crypto = await import('crypto');
    
    const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const sha1Hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Initialize scan results
    const scanResult = {
      filename: fileName,
      fileSize: fileSize,
      mimeType: mimeType,
      hashes: {
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash
      },
      riskScore: 0,
      threats: [],
      warnings: [],
      analysis: {
        fileType: '',
        isExecutable: false,
        isArchive: false,
        isScript: false,
        hasSuspiciousContent: false,
        entropy: 0,
        strings: []
      },
      scannedAt: new Date().toISOString()
    };

    // File Type Analysis - Check for suspicious file extensions
    const fileExtension = path.extname(fileName).toLowerCase();
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar', '.msi', '.dll', '.sys'];
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'];
    const scriptExtensions = ['.js', '.vbs', '.ps1', '.py', '.sh', '.bat', '.cmd'];

    if (suspiciousExtensions.includes(fileExtension)) {
      scanResult.analysis.isExecutable = true;
      scanResult.riskScore += 30;
      scanResult.threats.push('Executable file detected');
    }

    if (archiveExtensions.includes(fileExtension)) {
      scanResult.analysis.isArchive = true;
      scanResult.riskScore += 10;
      scanResult.warnings.push('Archive file - contents should be extracted and scanned');
    }

    if (scriptExtensions.includes(fileExtension)) {
      scanResult.analysis.isScript = true;
      scanResult.riskScore += 20;
      scanResult.threats.push('Script file detected');
    }

    // MIME Type Analysis - Check for suspicious MIME types
    const suspiciousMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msi',
      'application/x-dosexec',
      'application/x-msdos-program'
    ];

    if (suspiciousMimeTypes.includes(mimeType)) {
      scanResult.riskScore += 25;
      scanResult.threats.push('Suspicious MIME type detected');
    }

    // File Size Analysis
    if (fileSize === 0) {
      scanResult.riskScore += 5;
      scanResult.warnings.push('Empty file');
    } else if (fileSize > 100 * 1024 * 1024) { // 100MB
      scanResult.riskScore += 15;
      scanResult.warnings.push('Very large file (>100MB)');
    }

    // Entropy Analysis - Detect encrypted or packed content
    const entropy = calculateEntropy(fileBuffer);
    scanResult.analysis.entropy = entropy;
    
    if (entropy > 7.5) {
      scanResult.riskScore += 20;
      scanResult.threats.push('High entropy detected - possible encryption or packing');
    } else if (entropy > 6.5) {
      scanResult.riskScore += 10;
      scanResult.warnings.push('Moderate entropy detected');
    }

    // String Analysis - Extract readable strings and check for suspicious patterns
    const strings = extractStrings(fileBuffer);
    scanResult.analysis.strings = strings.slice(0, 50); // Limit to first 50 strings

    // Check for suspicious strings that might indicate malicious behavior
    const suspiciousPatterns = [
      /http[s]?:\/\//i,
      /ftp:\/\//i,
      /cmd\.exe/i,
      /powershell/i,
      /regsvr32/i,
      /rundll32/i,
      /wscript\.exe/i,
      /cscript\.exe/i,
      /netcat/i,
      /nc\.exe/i,
      /backdoor/i,
      /trojan/i,
      /virus/i,
      /malware/i,
      /exploit/i,
      /shellcode/i,
      /payload/i,
      /inject/i,
      /hook/i,
      /keylogger/i
    ];

    let suspiciousStringCount = 0;
    for (const str of strings) {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(str)) {
          suspiciousStringCount++;
          scanResult.threats.push(`Suspicious string found: ${str.substring(0, 50)}`);
          break;
        }
      }
    }

    if (suspiciousStringCount > 0) {
      scanResult.riskScore += suspiciousStringCount * 5;
      scanResult.analysis.hasSuspiciousContent = true;
    }

    // Magic Number Analysis - Identify file types by header bytes
    const magicNumbers = {
      'MZ': 'Windows executable',
      'PK': 'ZIP archive',
      'Rar!': 'RAR archive',
      '7F454C46': 'ELF executable',
      'CAFEBABE': 'Java class file',
      '504B0304': 'ZIP archive',
      '504B0506': 'ZIP archive',
      '504B0708': 'ZIP archive'
    };

    const fileHeader = fileBuffer.toString('hex', 0, 8).toUpperCase();
    for (const [magic, description] of Object.entries(magicNumbers)) {
      if (fileHeader.startsWith(magic)) {
        scanResult.analysis.fileType = description;
        if (description.includes('executable')) {
          scanResult.riskScore += 25;
          scanResult.threats.push('Executable file detected by magic number');
        }
        break;
      }
    }

    // PE Header Analysis for Windows executables
    if (fileHeader.startsWith('4D5A')) { // MZ header
      try {
        const peAnalysis = analyzePEHeader(fileBuffer);
        scanResult.analysis.peInfo = peAnalysis;
        
        if (peAnalysis.isDLL) {
          scanResult.riskScore += 15;
          scanResult.threats.push('DLL file detected');
        }
        
        if (peAnalysis.hasSuspiciousImports) {
          scanResult.riskScore += 20;
          scanResult.threats.push('Suspicious imports detected');
        }
      } catch (error) {
        scanResult.warnings.push('Could not analyze PE header');
      }
    }

    // Final Risk Assessment based on cumulative risk score
    if (scanResult.riskScore >= 80) {
      scanResult.severity = 'HIGH';
      scanResult.recommendation = 'File appears to be malicious. Do not execute.';
    } else if (scanResult.riskScore >= 50) {
      scanResult.severity = 'MEDIUM';
      scanResult.recommendation = 'File has suspicious characteristics. Exercise caution.';
    } else if (scanResult.riskScore >= 20) {
      scanResult.severity = 'LOW';
      scanResult.recommendation = 'File has some suspicious characteristics. Monitor behavior.';
    } else {
      scanResult.severity = 'SAFE';
      scanResult.recommendation = 'File appears to be safe.';
    }

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json(scanResult);

  } catch (error) {
    console.error('Custom file scan error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Custom file scan failed',
      details: error.message
    });
  }
}

/**
 * Calculate Shannon entropy of a buffer
 * Higher entropy indicates more random/encrypted content
 */
function calculateEntropy(buffer) {
  const byteCounts = new Array(256).fill(0);
  for (let i = 0; i < buffer.length; i++) {
    byteCounts[buffer[i]]++;
  }
  
  let entropy = 0;
  const length = buffer.length;
  
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const probability = byteCounts[i] / length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}

/**
 * Extract readable ASCII strings from binary data
 * Useful for finding URLs, commands, and other readable content
 */
function extractStrings(buffer) {
  const strings = [];
  let currentString = '';
  
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte >= 32 && byte <= 126) { // Printable ASCII
      currentString += String.fromCharCode(byte);
    } else {
      if (currentString.length >= 4) {
        strings.push(currentString);
      }
      currentString = '';
    }
  }
  
  if (currentString.length >= 4) {
    strings.push(currentString);
  }
  
  return strings;
}

/**
 * Analyze PE (Portable Executable) header for Windows executables
 * Extracts information about DLLs, imports, and file characteristics
 */
function analyzePEHeader(buffer) {
  const analysis = {
    isDLL: false,
    hasSuspiciousImports: false,
    imports: []
  };
  
  try {
    // Find PE header offset
    const peOffset = buffer.readUInt32LE(60);
    const signature = buffer.toString('ascii', peOffset, peOffset + 4);
    
    if (signature !== 'PE\0\0') {
      return analysis;
    }
    
    // Check file characteristics
    const characteristics = buffer.readUInt16LE(peOffset + 22);
    analysis.isDLL = (characteristics & 0x2000) !== 0;
    
    // Basic import analysis (simplified)
    const optionalHeaderSize = buffer.readUInt16LE(peOffset + 20);
    const importTableOffset = peOffset + 24 + optionalHeaderSize;
    
    // Check for suspicious imports
    const suspiciousImports = [
      'kernel32.dll', 'user32.dll', 'advapi32.dll', 'ws2_32.dll',
      'urlmon.dll', 'wininet.dll', 'ole32.dll', 'oleaut32.dll'
    ];
    
    // Check for suspicious imports in file content
    const fileContent = buffer.toString('ascii', 0, Math.min(buffer.length, 10000));
    for (const importName of suspiciousImports) {
      if (fileContent.includes(importName)) {
        analysis.imports.push(importName);
      }
    }
    
    if (analysis.imports.length > 3) {
      analysis.hasSuspiciousImports = true;
    }
    
  } catch (error) {
    console.log('PE header analysis error:', error.message);
  }
  
  return analysis;
} 