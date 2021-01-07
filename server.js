// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const fs = require('fs');


const bodyParser = require("body-parser");
const csv = require('fast-csv');
const http = require('http');



const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// get all todos
app.get('/api/v1/todos', (request, response) => {
  response.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully',
    todos: db
  })
});

app.get("/todos", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(db);
});

app.post('/csvtojson', (req, res) => {
  
  if(!req.body.csv) {
    return res.status(400).send({
      success: 'false',
      message: 'Invalid Payload Structure'
    });
  } else if(!req.body.csv.url) {
    return res.status(400).send({
      success: 'false',
      message: 'Missing CSV Link'
    });
  } else if(req.body.csv.select_fields) {
      let checkSelectFields = Array.isArray(req.body.csv.select_fields);
    
      if(!checkSelectFields) {
        return res.status(400).send({
          success: 'false',
          message: 'Invalid Data Type for select_fields'
        });
      }
  }
  

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
