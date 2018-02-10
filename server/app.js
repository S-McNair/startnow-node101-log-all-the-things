//load appropriate modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
var os = require('os');
var csvjson = require('csvjson');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.csv'));
//^^^variable to create a .csv file named 'log.csv' w/in the current directory
csv.write([['Agent','Time','Method','Resource','Version','Status'], []],{headers:true, delimiter:','}).pipe(accessLogStream);
//^^^assign to log.csv the headers "Agent...Status" as an array inside a larger array which features an empty array at the end to properly format the csv/json data
//^^^the ',' delimiter seperates array items by comma and enters them into their own cell/line in csv & JSON
//^^^use ".pipe" to pipe the data to accessLogStream

app.use(bodyParser.json());     //use bodyParser to parse JSON data

app.use((req, res, next) => {
// write your logging code here

var user = [                                    //get data from the headers & enter into an array, info on syntax gathered from Morgan Middleware GitHub Source Code
    req.get('User-Agent').replace(',', ' '),    //gets AGENT; AGENT string contains a "," that was being read by the delimiter, use ".replace" to eliminate the commas
    new Date().toISOString(),                   //DATE using ISOString to convert date to simplified extended ISO format
    req.method,                                 //METHOD
    req.url ,                                   //URL
    'HTTP/' + req.httpVersionMajor + '.' + req.httpVersionMinor,    //VERSION where httpVersionMajor is to the left tof the decimal and httpVersionMinor is to the right (i.e. HTTP/1.1)
    res.statusCode].join(',') + '\n';           //STATUS log server status code response, ".join(',')" method joins array elemetns together ads as tring seperated by ',' <<horizontal formatting>>

      //console.log(user);                         //proof of functionality

fs.appendFile('server/log.csv', user, function(err){      //appending 'user' array to headers in csv file
  if (err)  { throw err;  }
  else {
    console.log('The "data to append" was appended to the file!');
  }
  next();
}

)});


app.get('/', (req, res, next) => {
// write your code to respond "ok" here
    res.send('ok');                               //respond to GET requests to the homepage with "ok"
    next();

});


app.get('/logs', (req, res, next) => {
  //convert csv to JSON object below....
  var data = fs.readFileSync(path.join(__dirname, 'log.csv'), { encoding : 'utf8'});    //assigns csv data to a variable & converts Hexadecimal to an object using utf8
  //console.log(data);
  var options = {                         //creating a JSON object named "options"
        delimiter : ',',                  //seperate data points at ','

        };

  var data2 = csvjson.toObject(data, options);  //sends data stored in "var data" to JSON object "var options" and assings it to var data2

  //console.log(data2);
  res.json(data2);                             //send JSON formatted data as response to GET '/log' request via var data2

  next();

  });

module.exports = app;
