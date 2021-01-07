// server.js
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require("express");

const bodyParser = require("body-parser");
const csv = require('fast-csv');
const parser = require('csv-parser');

const app = express();

const results = ['a', 'b'];
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
  
  
 // await fs.createReadStream('public/profilogif.html')
 //   .pipe(convert())
 //   .pipe(fs.createWriteStream("assets/profilogif.gif"));

//   function to download csv from url
//   const download = (url, dest, cb) => {
//     const file = fs.createWriteStream(dest);
    
//     const request = https.get(url, (response) => {
//       response.pipe(file);
//       file.on('finish', () => {
//         file.close(cb);
//       });
//       return true;
//     }).on('error', (err) => {
//       // fs.unlink(dest); // Delete the file async
      
//       if (cb) cb(err.message);
//       var errorMsg = err.message
//       return false;
//     });
//   };
  
  async function download(url, filePath) {
//     check protocol
    const proto = !url.charAt(4).localeCompare('s') ? https : http;

    return new Promise((resolve, reject) => {
      
      const file = fs.createWriteStream(filePath);
      // The destination stream is ended by the time it's called
      file.on('finish', () => resolve(fileInfo));
      file.on('error', err => {
        fs.unlink(filePath, () => reject(err));
            return res.status(400).send({
                  status: 'failed',
                  message: 'Error Writing CSV File',
                  statusd: err
            });
      });
      
      let fileInfo = null;

      const request = proto.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }
            // return res.status(400).send({
            //       status: 'failed',
            //       message: 'Response',
            //       statusd: response
            // });
        fileInfo = {
          mime: response.headers['content-type'],
          size: parseInt(response.headers['content-length'], 10),
        };

        response.pipe(file);

      });
      

      request.on('error', err => {
        fs.unlink(filePath, () => reject(err));
                    return res.status(400).send({
                  status: 'failed',
                  message: 'Error Fetching CSV File',
                  statusd: err
            });
      });



      request.end();
    });
}
  download(csvlink, filepath);
  
        fs.createReadStream(filepath)
      .pipe(parser())
      .on('data', (data) => {
        results.push(data)
      })
      .on('end', () => {
        
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
        return res.status(200).send({
            status: 'success',
            message: results
        });
     });
  // let downloadStatus = download(csvlink, filepath);
  
//   if(downloadStatus == false) {
//     return res.status(400).send({
//           status: 'failed',
//           message: 'Error Fetching CSV File',
//           statusd: downloadStatus
//     });
//   } else {

//         return res.status(400).send({
//           status: 'failed',
//           message: 'CSV File Fetched',

//     });
//     const stream = csv.parseFile(filepath, { headers:true })
//         .on('error', error => {
//           return res.status(400).send({
//               status: 'failed',
//               message: error
//           });
//         })
//         .on('data', row => {
//           results.push(row);
// //           `ROW=${JSON.stringify(row)}`
//           // return res.status(200).send({
//           //     status: 'success',
//           //     message: row
//           // });
//         })
//         .on('end', rowCount => {
//           return res.status(200).send({
//               status: 'success',
//               message: rowCount
//           });
//         });
    
//     stream.end();

    
//       fs.createReadStream(filepath)
//       .pipe(parser())
//       .on('data', (data) => {
//         results.push(data)
//       })
//       .on('end', () => {
        
//         // [
//         //   { NAME: 'Daffy Duck', AGE: '24' },
//         //   { NAME: 'Bugs Bunny', AGE: '22' }
//         // ]
//         return res.status(200).send({
//             status: 'success',
//             message: results
//         });
//      });
    
// }

});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
