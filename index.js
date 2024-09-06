const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Convert base64-encoded keys from .env to buffers
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64"); // 32 bytes
const ENCRYPTION_IV = Buffer.from(process.env.ENCRYPTION_IV, "base64"); // 16 bytes

const students = [{ name: "John Doe", email: "pandeyyysuraj@gmail.com" }];

// Encrypt function to encrypt the student data
function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    ENCRYPTION_IV
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  console.log(encrypted);
  return encrypted;
}

// Decrypt function to decrypt the student data (for when you handle the URL)
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    ENCRYPTION_IV
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send email with encrypted URL
async function sendEmail(student) {
  // Encrypt student name and email
  const encryptedData = encrypt(
    JSON.stringify({ name: student.name, email: student.email })
  );

  // Construct the URL with encrypted data
  const ticketURL = `${process.env.APP_URL}/generate-qr?data=${encryptedData}`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: student.email,
    subject: "Your FOSS Meetup Ticket",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #0073e6;">FOSS Meetup Ticket</h1>
        <p>Hello <b>${student.name}</b>,</p>
        <p>Click the link below to generate your ticket with a QR code:</p>
        <p><a href="${ticketURL}" target="_blank">Get your ticket</a></p>
      </div>
    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error);
  }
}

// Main function to process students
async function processStudents() {
  for (let student of students) {
    await sendEmail(student);
  }
}

// Start processing students
processStudents();
