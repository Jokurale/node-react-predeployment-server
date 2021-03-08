const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("*", function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "static", "404.html"));
});


app.listen(3000, () => {
	console.log("[INFO] sdly-pl-react-app is up and running.")
})