import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'STRONG_JWT_SECRET_KEY_FOR_USERS_KO_LAGI';

/**
 * Submit user feedback endpoint
 * Stores feedback in text file with user information and metadata
 * Supports both authenticated and anonymous feedback submissions
 */
export async function submitFeedback(req, res) {
  const { rating, comment, email } = req.body;
  
  // Extract user info from JWT token if present
  let user = null;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        // Invalid token, proceed as anonymous user
      }
    }
  }
  
  try {
    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    // Validate rating range
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    // Validate comment length
    if (typeof comment !== 'string' || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Comment must be at least 10 characters long' });
    }

    // Validate email format if provided
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Prepare feedback data with metadata
    const feedbackData = {
      timestamp: new Date().toISOString(),
      username: user ? user.username : 'Anonymous',
      email: email || user?.email || 'Not provided',
      rating: rating,
      message: comment.trim(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    };

    // Create feedback directory if it doesn't exist
    const feedbackDir = path.join(__dirname, '../../feedback');
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }

    // Create feedback file path
    const feedbackFile = path.join(feedbackDir, 'feedback.txt');

    // Format the feedback entry for storage
    const feedbackEntry = `
=== FEEDBACK SUBMISSION ===
Date: ${feedbackData.timestamp}
Username: ${feedbackData.username}
Email: ${feedbackData.email}
Rating: ${feedbackData.rating}/5
Message: ${feedbackData.message}
User Agent: ${feedbackData.userAgent}
IP Address: ${feedbackData.ipAddress}
=====================================

`;

    // Append feedback to file
    fs.appendFileSync(feedbackFile, feedbackEntry, 'utf8');

    // Log feedback submission for monitoring
    console.log('Feedback submitted:', {
      username: feedbackData.username,
      email: feedbackData.email,
      rating: feedbackData.rating,
      messageLength: feedbackData.message.length
    });

    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback: {
        rating: feedbackData.rating,
        message: feedbackData.message.substring(0, 100) + (feedbackData.message.length > 100 ? '...' : '')
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
}

/**
 * Get feedback statistics endpoint
 * Reads feedback file and calculates aggregate statistics
 * Returns total submissions, average rating, and last submission time
 */
export async function getFeedbackStats(req, res) {
  try {
    const feedbackDir = path.join(__dirname, '../../feedback');
    const feedbackFile = path.join(feedbackDir, 'feedback.txt');

    // Return empty stats if no feedback file exists
    if (!fs.existsSync(feedbackFile)) {
      return res.json({
        totalSubmissions: 0,
        averageRating: 0,
        lastSubmission: null
      });
    }

    // Read and parse feedback file
    const content = fs.readFileSync(feedbackFile, 'utf8');
    const entries = content.split('=== FEEDBACK SUBMISSION ===').filter(entry => entry.trim());

    const stats = {
      totalSubmissions: entries.length,
      averageRating: 0,
      lastSubmission: null
    };

    if (entries.length > 0) {
      let totalRating = 0;
      let validRatings = 0;

      // Calculate total rating from all entries
      entries.forEach(entry => {
        const ratingMatch = entry.match(/Rating: (\d+)\/5/);
        if (ratingMatch) {
          totalRating += parseInt(ratingMatch[1]);
          validRatings++;
        }
      });

      // Calculate average rating
      if (validRatings > 0) {
        stats.averageRating = (totalRating / validRatings).toFixed(1);
      }

      // Get last submission timestamp
      const lastEntry = entries[entries.length - 1];
      const timestampMatch = lastEntry.match(/Date: (.+)/);
      if (timestampMatch) {
        stats.lastSubmission = timestampMatch[1];
      }
    }

    res.json(stats);

  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ 
      error: 'Failed to get feedback statistics',
      details: error.message
    });
  }
} 