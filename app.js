require("dotenv").config();
const express = require("express");
const app = express();
require("./db/conn");
const cors = require("cors");
const router = require("./Routes/router");
const PORT = process.env.PORT || 6010;

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("./uploads"))
app.use("/files",express.static("./public/files"))
app.use(router);
app.get('/', (req, res) => {
    res.send('Hello World!')
  })
app.listen(PORT,()=>{
    console.log(`Server start at port no ${PORT}`)
})