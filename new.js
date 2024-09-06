// generateIv.js
const crypto = require("crypto");

const iv = crypto.randomBytes(16).toString("base64");
console.log(`ENCRYPTION_IV=${iv}`);
