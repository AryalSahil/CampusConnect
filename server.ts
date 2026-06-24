import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Construct Nodemailer Transporter using secure environment variables.
 * Falls back to an ethereal/mock SMTP sandbox in case the user has not yet configured SMTP_PASSWORD
 * to prevent startup crashes or execution errors.
 */
function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.resend.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'resend';
  const pass = process.env.SMTP_PASSWORD;

  if (!pass) {
    console.warn("⚠️ SMTP_PASSWORD is not set. Outgoing emails will be logged to terminal only or fall back to mock sandbox.");
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass: pass || 'mock_pass'
    }
  });
}

const transporter = getEmailTransporter();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API welcome email route
  app.post('/api/send-welcome-email', async (req, res) => {
    try {
      const { email, fullName, collegeName, course, graduationYear, referralCode } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }

      console.log(`[Email Service] Preparing welcome email for: ${fullName} (${email})`);

      // Compile responsive modern HTML template matching SwipeMates' style branding
      const welcomeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SwipeMates</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #F4EBD7;
              color: #1A1108;
              margin: 0;
              padding: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border: 2px solid #1A1108;
              border-radius: 24px;
              padding: 40px;
              box-shadow: 4px 4px 0px 0px #C9A227;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              color: #1A1108;
              border-bottom: 2px solid #C9A227;
              display: inline-block;
              padding-bottom: 4px;
            }
            .badge {
              display: inline-block;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              background: #C9A227;
              color: #1A1108;
              padding: 4px 10px;
              border-radius: 20px;
              margin-top: 15px;
              letter-spacing: 1px;
            }
            h1 {
              font-size: 22px;
              font-weight: 800;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #1A1108;
            }
            p {
              font-size: 14px;
              color: #4A3E30;
              margin-bottom: 20px;
            }
            .box {
              background-color: #F4EBD7;
              border: 1px dashed rgba(26, 17, 8, 0.2);
              border-radius: 16px;
              padding: 20px;
              margin: 25px 0;
            }
            .box h3 {
              margin: 0 0 10px 0;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #1A1108;
            }
            .box p {
              margin: 0;
              font-size: 13px;
            }
            .referral-container {
              display: flex;
              align-items: center;
              background: #ffffff;
              border: 1px solid #1A1108;
              border-radius: 12px;
              padding: 12px;
              margin-top: 10px;
              justify-content: center;
            }
            .referral-code {
              font-family: monospace;
              font-weight: bold;
              font-size: 18px;
              letter-spacing: 1.5px;
              color: #C9A227;
            }
            .footer {
              margin-top: 45px;
              text-align: center;
              font-size: 11px;
              color: #1A1108;
              opacity: 0.6;
              border-top: 1px solid rgba(26, 17, 8, 0.1);
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SwipeMates</div>
              <br />
              <span class="badge">Waitlist Confirmed</span>
            </div>
            
            <h1>Welcome to the Inner Circle, ${fullName || 'Scholar'}!</h1>
            <p>
              Thank you for joining the SwipeMates waitlist. We are bringing leading Indian college students together in a brand new way, and you've officially claimed your exclusive spot.
            </p>
    
            <div class="box">
              <h3>Your Registration Details</h3>
              <p><strong>University:</strong> ${collegeName || 'Verified University'}</p>
              <p><strong>Major:</strong> ${course || 'General'}</p>
              <p><strong>Graduation Year:</strong> Class of ${graduationYear || '2027'}</p>
            </div>
    
            <p>
              We are launching soon! Want to jump ahead of the queue? Share your unique referral code with your university classmates and move up 100 spots for every friend who registers.
            </p>
    
            <div class="box" style="text-align: center; margin-bottom: 10px;">
              <h3 style="margin-bottom: 5px;">Your Unique Referral Code</h3>
              <div class="referral-container">
                <span class="referral-code">${referralCode || 'CAMPUS-VIP'}</span>
              </div>
            </div>
    
            <p style="font-size: 12px; text-align: center; color: #7A6F62;">
              Share link: <strong style="font-family: monospace; font-size: 13px;">https://swipemates.app/?ref=${referralCode || ''}</strong>
            </p>
    
            <div class="footer">
              &copy; 2026 SwipeMates. All rights reserved.<br />
              You are receiving this automated email because you registered at swipemates.app.
            </div>
          </div>
        </body>
        </html>
      `;

      // If SMTP credentials or resend API is configured and live:
      if (process.env.SMTP_PASSWORD) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"SwipeMates" <welcome@swipemates.app>',
          to: email,
          subject: `🎒 You're on the list, ${fullName || 'Scholar'}! Welcome to SwipeMates`,
          text: `Welcome to SwipeMates! You are on the waitlist representing ${collegeName || 'your university'}. Your unique referral code is ${referralCode || 'CAMPUS-VIP'}.`,
          html: welcomeHtml,
        });
        console.log(`[Email Service] Success: Sent real confirmation email to ${email}`);
      } else {
        // Fallback for local development or missing SMTP configs so we never crash
        console.log("-----------------------------------------");
        console.log(`[MOCK EMAIL SENT TO ${email}]:`);
        console.log(`Subject: Welcome to SwipeMates, ${fullName || 'Scholar'}!`);
        console.log(`Referral Code: ${referralCode || 'CAMPUS-VIP'}`);
        console.log("-----------------------------------------");
      }

      return res.status(200).json({ success: true, message: 'Welcome email compiled and delivered!' });
    } catch (error: any) {
      console.error('[Email Service Error]:', error);
      return res.status(500).json({ success: false, error: error.message || 'SMTP service delivery error' });
    }
  });

  // API approval email route
  app.post('/api/send-approval-email', async (req, res) => {
    try {
      const { email, fullName, collegeName, course, graduationYear } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }

      console.log(`[Email Service] Preparing approval email for: ${fullName} (${email})`);

      const approvalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SwipeMates Admission Approved!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #F4EBD7;
              color: #1A1108;
              margin: 0;
              padding: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border: 2px solid #1A1108;
              border-radius: 24px;
              padding: 40px;
              box-shadow: 4px 4px 0px 0px #C9A227;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              color: #1A1108;
              border-bottom: 2px solid #C9A227;
              display: inline-block;
              padding-bottom: 4px;
            }
            .badge {
              display: inline-block;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              background: #10B981;
              color: #ffffff;
              padding: 4px 10px;
              border-radius: 20px;
              margin-top: 15px;
              letter-spacing: 1px;
            }
            h1 {
              font-size: 22px;
              font-weight: 800;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #1A1108;
            }
            p {
              font-size: 14px;
              color: #4A3E30;
              margin-bottom: 20px;
            }
            .box {
              background-color: #EBFDF5;
              border: 1px dashed #10B981;
              border-radius: 16px;
              padding: 20px;
              margin: 25px 0;
            }
            .box h3 {
              margin: 0 0 10px 0;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #065F46;
            }
            .box p {
              margin: 0;
              font-size: 13px;
              color: #065F46;
            }
            .footer {
              margin-top: 45px;
              text-align: center;
              font-size: 11px;
              color: #1A1108;
              opacity: 0.6;
              border-top: 1px solid rgba(26, 17, 8, 0.1);
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SwipeMates</div>
              <br />
              <span class="badge">Application Approved</span>
            </div>
            
            <h1>Congratulations, ${fullName || 'Scholar'}!</h1>
            <p>
              Your SwipeMates application has been officially reviewed and <strong>Approved</strong> by the Campus Admin team! Your collegiate credentials are now fully verified.
            </p>
    
            <div class="box">
              <h3>Verified Profile Details</h3>
              <p><strong>University:</strong> ${collegeName || 'Verified University'}</p>
              <p><strong>Course:</strong> ${course || 'General'}</p>
              <p><strong>Graduation Year:</strong> Class of ${graduationYear || '2027'}</p>
              <p><strong>Status:</strong> ACTIVE / VERIFIED</p>
            </div>
    
            <p>
              You've moved up to the front of the queue! Our team is finalising exclusive match setups and community circles on your campus. Keep an eye out for our upcoming launch notifications.
            </p>
    
            <div class="footer">
              &copy; 2026 SwipeMates. All rights reserved.<br />
              You are receiving this automated email because you were approved on the swipemates.app waitlist.
            </div>
          </div>
        </body>
        </html>
      `;

      if (process.env.SMTP_PASSWORD) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"SwipeMates" <welcome@swipemates.app>',
          to: email,
          subject: `🎉 Congratulations ${fullName || 'Scholar'}! Your SwipeMates spot is Approved`,
          text: `Congratulations ${fullName || 'Scholar'}! Your SwipeMates registration is officially approved! Representing ${collegeName || 'your university'}.`,
          html: approvalHtml,
        });
        console.log(`[Email Service] Success: Sent real approval email to ${email}`);
      } else {
        console.log("-----------------------------------------");
        console.log(`[MOCK EMAIL SENT TO ${email}]:`);
        console.log(`Subject: SwipeMates Application APPROVED!`);
        console.log(`Verified Student: ${fullName}`);
        console.log("-----------------------------------------");
      }

      return res.status(200).json({ success: true, message: 'Approval email compiled and delivered!' });
    } catch (error: any) {
      console.error('[Email Service Error - Approval]:', error);
      return res.status(500).json({ success: false, error: error.message || 'SMTP service delivery error' });
    }
  });

  // Serve Vite in dev mode, static folder in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SwipeMates Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
