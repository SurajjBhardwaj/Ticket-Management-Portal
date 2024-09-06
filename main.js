const express = require("express");
const QRCode = require("qrcode");
const crypto = require("crypto");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();

// Convert base64-encoded keys from .env to buffers
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
const ENCRYPTION_IV = Buffer.from(process.env.ENCRYPTION_IV, "base64");

// Debugging output
console.log(`Key Length: ${ENCRYPTION_KEY.length} bytes`);
console.log(`IV Length: ${ENCRYPTION_IV.length} bytes`);
console.log(`Key: ${ENCRYPTION_KEY.toString("hex")}`);
console.log(`IV: ${ENCRYPTION_IV.toString("hex")}`);

// Decrypt function to decrypt the student data
function decrypt(text) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    ENCRYPTION_IV
  );
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Route to handle the encrypted URL
app.get("/generate-qr", async (req, res) => {
  const encryptedData = req.query.data;

  console.log(encryptedData);

  // Decrypt the data
  let studentData;
  try {
    studentData = JSON.parse(decrypt(encryptedData));
  } catch (error) {
    return res.status(400).send("Invalid or corrupted data");
  }

  // Generate the QR code as Data URL (base64)
  const qrCodeDataURL = await QRCode.toDataURL(
    `Ticket for ${studentData.name}`
  );

  // Render ID card with QR code
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center;">
      <h1>FOSS Meetup Ticket</h1>
      <h2>${studentData.name}</h2>
      <h3>${studentData.email}</h3>
      <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 300px;"/>
      <br><br>
      <a href="/download-image?data=${encryptedData}" target="_blank">Download as Image</a> |
      <a href="/download-pdf?data=${encryptedData}" target="_blank">Download as PDF</a>
    </div>
  `;
  res.send(html);
});

// Route to download ID card as an image
app.get("/download-image", async (req, res) => {
  const encryptedData = req.query.data;
  let studentData;

  try {
    studentData = JSON.parse(decrypt(encryptedData));
  } catch (error) {
    return res.status(400).send("Invalid or corrupted data");
  }

  // Generate QR code as image buffer
  const qrCodeBuffer = await QRCode.toBuffer(`Ticket for ${studentData.name}`);

  // Create canvas to draw ID card
  const canvas = createCanvas(400, 600);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 400, 600);

  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("FOSS Meetup Ticket", 80, 50);
  ctx.fillText(studentData.name, 80, 100);
  ctx.fillText(studentData.email, 80, 150);

  const qrImg = await loadImage(qrCodeBuffer);
  ctx.drawImage(qrImg, 120, 200, 160, 160);

  // Send canvas image as PNG
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", 'attachment; filename="ticket.png"');
  canvas.toBuffer((err, buf) => {
    if (err) throw err;
    res.send(buf);
  });
});

// Route to download ID card as a PDF
app.get("/download-pdf", async (req, res) => {
  const encryptedData = req.query.data;

  console.log("hey");
  console.log(encryptedData);

  let studentData;
  try {
    studentData = JSON.parse(decrypt(encryptedData));
  } catch (error) {
    return res.status(400).send("Invalid or corrupted data");
  }

  // Generate QR code as buffer
  const qrCodeBuffer = await QRCode.toBuffer(`Ticket for ${studentData.name}`);

  // Create a PDF document
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="ticket.pdf"');
  doc.fontSize(20).text("FOSS Meetup Ticket", 100, 50);
  doc.fontSize(15).text(`Name: ${studentData.name}`, 100, 100);
  doc.fontSize(15).text(`Email: ${studentData.email}`, 100, 130);

  doc.image(qrCodeBuffer, 150, 180, { fit: [200, 200] });
  doc.pipe(res);
  doc.end();
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
