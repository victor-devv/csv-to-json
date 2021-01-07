// server.js
const http = require('http');
const fs = require('fs');
const express = require("express");

const bodyParser = require("body-parser");
const csv = require('fast-csv');

const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


app.post('/csvtojson', (req, res) => {
  
  if(!req.body.csv) {
    return res.status(400).send({
      status: 'failed',
      message: 'Invalid Payload Structure'
    });
  } else if(!req.body.csv.url) {
    return res.status(400).send({
      status: 'failed',
      message: 'Missing CSV Link'
    });
  } else if(req.body.csv.select_fields) {
      let checkSelectFields = Array.isArray(req.body.csv.select_fields);
    
      if(!checkSelectFields) {
        return res.status(400).send({
          status: 'failed',
          message: 'Invalid Data Type for select_fields'
        });
      }
  }
  
//   file close callback
  const cb = (err = null) => { 
    if (err) {
     return res.status(400).send({
          status: 'failed',
          message: 'Error Closing CSV File.'
      });
    }
  }
  
  let csvlink = req.body.csv;
  let filepath = 'receivedfile.csv';
  
//   function to download csv from url
  const download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    
    const request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);
      });
      return true;
    }).on('error', function(err) {
      fs.unlink(dest); // Delete the file async
      
      if (cb) cb(err.message);
      return false;
    });
  };
  
  let downloadStatus = download(csvlink, filepath, cb);
  
  if(!downloadStatus) {
    return res.status(400).send({
          status: 'failed',
          message: 'Error Fetching CSV File.'
    });
  } else {
    
    const csvStream = csv.parseFile('my.csv')
        .on('error', error => {
          return res.status(400).send({
              status: 'failed',
              message: error
          });
        })
        .on('data', row => {
          return res.status(200).send({
              status: 'failed',
              message: `ROW=${JSON.stringify(row)}`
          });
        })
        .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
    
  }

});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
