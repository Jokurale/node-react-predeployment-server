const express = require("express");

const app = express();

var path = require("path");
var public = path.join(__dirname, "build");

app.get("/", function (req, res) {
  res.sendFile(path.join(public, "index.html"));
  return;
});

app.use("/", express.static(public));

app.listen(process.env.PORT, () => {
  console.log("Predepolyment server is up and running.");
});