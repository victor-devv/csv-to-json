// server.js
const http = require('http');
const https = require('https');
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
  
  let csvlink = req.body.csv.url;
  let filepath = '/receivedfile.csv';
  
//   function to download csv from url
  const download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(cb);
      });
      return true;
    }).on('error', (err) => {
      // fs.unlink(dest); // Delete the file async
      
      if (cb) cb(err.message);
      var errorMsg = err.message
      return false;
    });
  };
  
  let downloadStatus = download(csvlink, filepath, cb);
  
  if(downloadStatus == false) {
    return res.status(400).send({
          status: 'failed',
          message: 'Error Fetching CSV File',
          statusd: downloadStatus
    });
  } else {
//         return res.status(400).send({
//           status: 'failed',
//           message: 'CSV File Fetched',

//     });
    const stream = csv.parseFile(csvlink, { headers:true })
        .on('error', error => {
          return res.status(400).send({
              status: 'failed',
              message: error
          });
        })
        .on('data', row => {
//           `ROW=${JSON.stringify(row)}`
          return res.status(200).send({
              status: 'success',
              message: row
          });
        })
        .on('end', rowCount => {
          // return res.status(200).send({
          //     status: 'success',
          //     message: 'Parse Ended'
          // });
        });
    
    stream.end();
    
  }

});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
