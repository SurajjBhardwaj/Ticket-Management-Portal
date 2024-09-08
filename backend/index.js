const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());

const port = process.env.PORT || 5001; 

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/user", (req, res) => {
   res.status(200).send({ data: "Hello World" });
});
 
 
app.listen(port, () =>{ 
   console.log(process.env.PORT);
   console.log(`Server running on port ${port} 🔥`)
});
  

module.exports = app;