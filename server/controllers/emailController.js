const nodemailer = require("nodemailer");

const sendEmailController = async (req, res) => {
  try {
    const { recipientEmail, studentName, courseName, instituteName, department, completionDate, certificateHash, verificationUrl, qrCodeImage, additionalMessage } = req.body;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // App Password (NOT your Gmail password)
      },
    });

    let mailOptions = {
      from: `"CertiQ" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: "Your Issued Certificate",
      html:`
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate Verification</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .certificate-details { background-color: #f9f9f9; border-left: 4px solid #2c7be5; padding: 15px; margin-bottom: 20px; }
              .detail-row { margin-bottom: 10px; }
              .detail-label { font-weight: bold; color: #555; }
              .verification { background-color: #e8f4fe; padding: 15px; text-align: center; margin: 25px 0; border-radius: 5px; }
              .verify-button { display: inline-block; background-color: #2c7be5; color: white !important; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; }
              .qr-code { text-align: center; margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
              .additional-message { margin-top: 25px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>CertiQ</h1>
              <p>A Decentralized Certificate Issuance and Verification System.</p>
          </div>
          
          <p>Dear <strong>${studentName}</strong>,</p>
          
          <p>Congratulations! Your certificate for completing <strong>${courseName}</strong> has been issued and recorded on the blockchain.</p>
          
          <div class="certificate-details">
              <div class="detail-row"><span class="detail-label">Institute:</span> ${instituteName}</div>
              <div class="detail-row"><span class="detail-label">Department:</span> ${department}</div>
              <div class="detail-row"><span class="detail-label">Course:</span> ${courseName}</div>
              <div class="detail-row"><span class="detail-label">Completion Date:</span> ${completionDate}</div>
              <div class="detail-row"><span class="detail-label">Certificate Hash:</span> ${certificateHash}</div>
          </div>

          ${additionalMessage ? `
          <div class="additional-message">
              <p><strong>Message from the issuer:</strong></p>
              <p>${additionalMessage}</p>
          </div>
          ` : ''}

          <div class="verification">
              <p>You can verify the authenticity of this certificate by clicking the button below</p>
              <a href="${verificationUrl}" class="verify-button">Verify Certificate</a>
          </div>
          
          <p>This certificate is tamper-proof and permanently recorded on the blockchain.</p>

          <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 Certificate Verification System. All rights reserved.</p>
          </div>
      </body>
      </html>
    `,
    };

    let info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

module.exports = sendEmailController;

