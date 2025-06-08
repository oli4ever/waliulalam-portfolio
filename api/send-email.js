import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST'] 
    });
  }

  try {
    console.log('=== Email API Called ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Check environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    console.log('Environment check:');
    console.log('GMAIL_USER exists:', !!gmailUser);
    console.log('GMAIL_APP_PASSWORD exists:', !!gmailPassword);
    console.log('GMAIL_USER value:', gmailUser ? `${gmailUser.substring(0, 3)}***@${gmailUser.split('@')[1]}` : 'not set');

    if (!gmailUser || !gmailPassword) {
      console.error('Missing email configuration');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Email service is not properly configured'
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = req.body;
      console.log('Request body received:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: 'Request body must be valid JSON'
      });
    }

    const { name, email, message } = body || {};
    
    // Validate required fields
    const errors = {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Name is required and must be a non-empty string';
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.email = 'Email is required and must be a non-empty string';
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.message = 'Message is required and must be a non-empty string';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: { email: 'Please enter a valid email address' }
      });
    }

    // Create transporter with explicit configuration
    console.log('Creating nodemailer transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter connection
    try {
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({ 
        error: 'Email service verification failed',
        details: 'Unable to connect to email service. Please check SMTP configuration.'
      });
    }

    // Prepare mail options
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    const mailOptions = {
      from: `"${cleanName}" <${gmailUser}>`,
      to: gmailUser,
      replyTo: cleanEmail,
      subject: `Portfolio Contact: Message from ${cleanName}`,
      text: `
Name: ${cleanName}
Email: ${cleanEmail}
Message:
${cleanMessage}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #cd7c2e; border-bottom: 2px solid #cd7c2e; padding-bottom: 10px;">
            New Portfolio Contact Form Submission
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong style="color: #333;">Name:</strong> ${cleanName}</p>
            <p><strong style="color: #333;">Email:</strong> 
              <a href="mailto:${cleanEmail}" style="color: #cd7c2e; text-decoration: none;">
                ${cleanEmail}
              </a>
            </p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <p><strong style="color: #333;">Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; margin-top: 10px; border-left: 4px solid #cd7c2e; white-space: pre-wrap;">
${cleanMessage}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>This email was sent from your portfolio contact form.</p>
          </div>
        </div>
      `
    };

    console.log('Preparing to send email...');
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      replyTo: mailOptions.replyTo,
      subject: mailOptions.subject
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return res.status(200).json({ 
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== EMAIL SENDING FAILED ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Time:', new Date().toISOString());
    
    // Determine error type and provide appropriate response
    let errorMessage = 'Failed to send message';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to email server. Please try again later.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email sending timed out. Please try again.';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'Invalid email credentials. Please check your email configuration.';
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        stack: error.stack
      } : 'Please try again later'
    });
  }
}