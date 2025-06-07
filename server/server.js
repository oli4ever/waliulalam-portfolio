require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Verify environment variables on startup
console.log('Environment Variables:', {
  GMAIL_USER: process.env.GMAIL_USER || 'Missing',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Exists' : 'Missing'
});

// Create transporter with more robust configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  logger: true,
  debug: true,
  pool: true, // Use connection pooling
  maxConnections: 1,
  maxMessages: 5
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Email endpoint with improved validation and error handling
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mailOptions = {
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `You have received a new message from your portfolio contact form.\n\n
             Name: ${name}\n
             Email: ${email}\n
             Message:\n${message}`,
      html: `
       <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong style="color: #555;">Name:</strong> ${name}</p>
          <p><strong style="color: #555;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong style="color: #555;">Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #cd7c2e; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This message was sent via your portfolio contact form.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    res.json({ 
      success: true,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Mail Error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : null
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});