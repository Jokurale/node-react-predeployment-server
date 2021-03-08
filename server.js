const express = require("express");
const app = express();

const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const rateLimit = require("express-rate-limit");

const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.use("/msg", limiter);
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  process.env.MONGO_DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log(
      "[Mongo DB Atlas] Connection with DBaaS established successfully."
    );
  }
);

const MessageModel = mongoose.model(
  "Messages",
  new Schema(
    {
      name: String,
      email: String,
      message: String,
      ip: String,
      proxy: String,
    },
    { timestamps: true }
  )
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.log("[WARN] Server recieved invalid JSON.");
    return res.sendStatus(400);
  }

  next();
});

app.post("/msg", (req, res) => {
  const token = req.headers.authorization || false;

  if (!token) {
    res.json({ error: true });
    return;
  }

  if (token.split(" ")[1] !== process.env.API_KEY) {
    res.json({ error: true });
    return;
  }

  if ("name" in req.body && "email" in req.body && "message" in req.body) {
    const { name, email, message } = req.body;

    MessageModel({
      name,
      email,
      message,
      ip: req.socket.remoteAddress,
      proxy: req.headers["x-forwarded-for"],
    }).save();

    console.log("[INFO] New message recieved.");

    res.json({ message: "ok" });
    return;
  }

  res.json({ message: "invalid" });
});

app.use("/msg", (req, res) => {
  res.status(403).json({ error: "Unauthorized request" });
});

app.use(express.static(path.join(__dirname, "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("*", function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "static", "404.html"));
});

app.listen(3000, () => {
  console.log("[INFO] sdly-pl-react-app is up and running.");
});
