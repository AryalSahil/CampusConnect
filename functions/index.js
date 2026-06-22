/**
 * Cloud Functions for Firebase: Send Automated Welcome Email Trigger
 * Triggers on document creation in the 'waitlist' collection.
 * 
 * To deploy this to your production Firebase environment:
 * 1. Initialize functions using `firebase init functions`
 * 2. Copy this file to `functions/index.js`
 * 3. Configure your mail service credentials (e.g., SendGrid, Resend)
 * 4. Run `firebase deploy --only functions`
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

// Configure the nodemailer transport.
// Replace these with your real production SMTP or API key settings!
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "resend",
    pass: process.env.SMTP_PASSWORD || "re_your_api_key_here",
  },
});

/**
 * Triggers when a new student waitlist registration is added.
 */
exports.sendWelcomeEmailTrigger = onDocumentCreated("waitlist/{waitlistId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with this creation event.");
    return;
  }

  const studentData = snapshot.data();
  const studentEmail = studentData.email;
  const fullName = studentData.fullName;
  const collegeName = studentData.collegeName;
  const referralCode = studentData.referralCode;

  logger.info(`Waitlist Created: ID ${event.params.waitlistId} for Student ${fullName} (${studentEmail})`);

  if (!studentEmail) {
    logger.warn("Skipping email delivery. No email address verified for waitlist document.");
    return;
  }

  // Compile the modern responsive welcome email template
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Campus Connect</title>
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
          border: 1px solid #1A1108;
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
          border-t: 1px solid rgba(26, 17, 8, 0.1);
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Campus Connect</div>
          <br />
          <span class="badge">Waitlist Confirmed</span>
        </div>
        
        <h1>Welcome to the Inner Circle, ${fullName}!</h1>
        <p>
          Thank you for joining the Campus Connect waitlist. We are bringing college students together in a brand new way, and you've officially claimed your spot.
        </p>

        <div class="box">
          <h3>Your Registration Details</h3>
          <p><strong>University:</strong> ${collegeName}</p>
          <p><strong>Major:</strong> ${studentData.course || "General studies"}</p>
          <p><strong>Graduation Year:</strong> Class of ${studentData.graduationYear}</p>
        </div>

        <p>
          We're launching soon! Want to jump ahead of the queue? Share your unique referral code with your university classmates and move up 100 spots for every friend who registers.
        </p>

        <div class="box" style="text-align: center; margin-bottom: 10px;">
          <h3 style="margin-bottom: 5px;">Your Unique Referral Code</h3>
          <div class="referral-container">
            <span class="referral-code">${referralCode || "CAMPUS-VIP"}</span>
          </div>
        </div>

        <p style="font-size: 12px; text-align: center; color: #7A6F62;">
          Share link: <strong style="font-family: monospace; font-size: 13px;">https://campusconnect.edu/?ref=${referralCode || ""}</strong>
        </p>

        <div class="footer">
          &copy; 2026 Campus Connect. All rights reserved.<br />
          You are receiving this automated email because you registered at campusconnect.edu.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Campus Connect Support" <welcome@campusconnect.edu>',
      to: studentEmail,
      subject: `🎒 You're on the list, ${fullName}! Welcome to Campus Connect`,
      text: `Welcome to Campus Connect, ${fullName}! You've registered with ${collegeName}. Your referral code is: ${referralCode || "CAMPUS-VIP"}`,
      html: welcomeHtml,
    });

    logger.info(`Email successfully sent: messageId=${info.messageId}`);
  } catch (error) {
    logger.error("Failed to send welcome email via nodemailer:", error);
    throw error;
  }
});
