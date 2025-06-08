import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
function loadEnvVariables() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envFile = readFileSync(envPath, 'utf8');
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.log('⚠️  Could not load .env file:', error.message);
  }
}

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Load environment variables
  loadEnvVariables();
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? '✓ Set' : '❌ Missing');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '❌ Missing');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('\n❌ Missing email credentials. Please check your .env file.\n');
    console.log('Expected format:');
    console.log('GMAIL_USER=your-email@gmail.com');
    console.log('GMAIL_APP_PASSWORD=your-16-char-app-password');
    process.exit(1);
  }
  
  console.log(`\n📧 Email: ${process.env.GMAIL_USER.substring(0, 3)}***@${process.env.GMAIL_USER.split('@')[1]}`);
  console.log(`🔑 Password: ${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}************\n`);
  
  try {
    // Create transporter
    console.log('🔧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');
    
    // Send test email
    console.log('📤 Sending test email...');
    const testMailOptions = {
      from: `"Portfolio Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: '🧪 Portfolio Email Test - Success!',
      text: 'This is a test email from your portfolio contact form. If you receive this, your email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #cd7c2e;">🎉 Email Test Successful!</h2>
          <p>Congratulations! Your portfolio email configuration is working correctly.</p>
          <div style="background-color: #f0f8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>✅ SMTP connection established</li>
              <li>✅ Authentication successful</li>
              <li>✅ Email delivery confirmed</li>
            </ul>
          </div>
          <p>Your contact form should now work properly on both localhost and production.</p>
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This test was run on ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📡 Response:', info.response);
    
    console.log('\n🎉 All tests passed! Your email configuration is working correctly.');
    console.log('💡 Your contact form should now work on both localhost and production.\n');
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Your Gmail address is correct');
      console.log('   2. You\'re using an App Password (not your regular password)');
      console.log('   3. 2-Factor Authentication is enabled on your Gmail account');
      console.log('   4. The App Password is exactly 16 characters');
      console.log('   5. Remove any spaces from the App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. This might be a network issue.');
    }
    
    console.log('\n📚 For help setting up Gmail App Passwords:');
    console.log('   https://support.google.com/accounts/answer/185833\n');
    
    process.exit(1);
  }
}

// Run the test
testEmail();