// server.js

const express = require("express");

const axios = require("axios");
const { v4: uuid4 } = require("uuid");
const { parse } = require("fast-csv");

const pino = require("pino");
const expressPino = require("express-pino-logger");
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const expressLogger = expressPino({ logger });

const { RateLimiterMemory } = require("rate-limiter-flexible");
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
  blockDuration: 300,
});

var cors = require('cors')
const app = express();
app.use(expressLogger);
app.use(cors());

// limit incoming requests
app.use((req, res, next) => {
  rateLimiter
    .consume(req.socket.remoteAddress)
    .then(() => {
      next();
    })
    .catch((err) => {
      return res.status(429).send({
        status: "failed",
        message: "Too many requests"
      });
    });
});


//parse incoming requests
app.use(express.json());

//filter elements in select_field
const selected = (object, keys) => keys.reduce((a, b) => ((a[b] = object[b]), a), {});

app.post('/csvtojson', async (req, res) => {
  const requestData = req.body;
  let response = [];
  
  if(!requestData.csv) {
    return res.status(400).send({
      status: 'failed',
      message: 'Invalid Payload Structure. Required Field `csv` Missing'
    });
  }
  
  if(!requestData.csv.url) {
    return res.status(400).send({
      status: 'failed',
      message: "Invalid Payload Structure. Required Field `csv['url']` Missing"
    });
  }
  
  if(requestData.csv.select_fields) {
      let checkSelectFields = Array.isArray(req.body.csv.select_fields);
    
      if(!checkSelectFields) {
        return res.status(400).send({
          status: 'failed',
          message: "Invalid Data Type for `csv['select_fields']`"
        });
      }
  }
  
  const {
    csv: { url, select_fields },
  } = requestData;

  const csvReq = await axios.get(url);
  
  //validate csv file
  if (csvReq.headers["content-disposition"].split(".").pop() !== 'csv"') {
    return res.status(400).send({
      status: "failed",
      message: "Url does not contain a valid CSV file",
    });
  }
  
//   Else parse file
  const stream = parse({
    headers: true,
    ignoreEmpty: true,
    trim: true,
    maxRows: length ? length : 0,
  })
  .on("data", (row) => {
    if (!select_fields) {
      response.push(row);
    } else {
      response.push(selected(row, select_fields));
    }
  })
  .on("error", () => {
    return res.status(500).send({
      status: "failed",
      message: "Unable to parse csv file"
    });
  })
  .on("end", (rowsCount) => {
    logger.info(`Converted ${rowsCount} rows to JSON`);
    return res.status(200).send({
      conversion_key: uuid4(),
      json: response,
    });
  });

  stream.write(csvReq.data);
  stream.end();
  
});



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
