const express = require('express');
const path = require('path');
const app = express();
const port = 6070;

app.use(express.static('./build'));

app.get('/', function (req, res) {
  console.log("frontend started at port :"+ port);
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/*', function (req, res) {
  console.log("frontend started at port :"+ port);
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port);
