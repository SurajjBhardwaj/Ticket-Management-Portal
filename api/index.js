const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());


app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/user", (req, res) => {
   res.status(200).send({ data: "Hello World" });
});
 
 
app.listen(3000, () =>{ 
   console.log(`Server running on port 3000 🔥`)
});
  

module.exports = app;