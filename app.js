const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require('./Routes/user.routes');
const fs = require('fs');
const path = require('path');
const globalError = require('./Controllers/error-controller/error.controller');
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Serve static assets (including index.html) from the build directory
app.use("/static",express.static(path.join(__dirname, './build/static'),{
  maxAge:86400000,
setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')||
path.endsWith('.jsx')) {
      res.setHeader('Cache-Control', 'public, max-age=' + 86400000);
    }
  },
}));
app.get('/favicon.png', (req, res) => {
  const faviconPath = path.join(__dirname, './build/favicon.png');
  fs.readFile(faviconPath, (err, data) => {
    if (err) {
      console.error('Error reading favicon file:', err);
      res.status(404).end();
    } else {
      res.setHeader('Content-Type', 'image/x-icon');
      res.send(data);
    }
  });
});
// Handle all routes on the server side and serve index.html
app.get(/^(?!\/api\b).*|^\/?$/
, (req, res) => {
  const indexHtml = fs.readFileSync(path.join(__dirname, './build/index.html'), 'utf8');
  res.send(indexHtml);
});
app.use(express.json());
app.use('/api/v1', router);
app.options('*', cors());
app.use(globalError);
app.use(express.urlencoded({ extended: true }));
module.exports = app;
