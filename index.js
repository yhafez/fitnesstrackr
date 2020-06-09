// /index.js

//Server


/*------------------------------------------------------------------------Required packages and Middleware ------------------------------------------------------------------------*/

//Require and configure dotenv, allowing use of .env file
require('dotenv').config();

//Import client from database and connect to client
const { client } = require ('./db');
client.connect();

//Set port to that specified in the environment (for Heroku), else to port 3000
const { PORT = 3000 } = process.env;

//Require express and set up an express server
const express = require('express');
const server = express();

// const cors = require('cors');
// server.use(cors());

//Require body-parser and bind to server to parse requests into usable json objects
const bodyParser = require('body-parser');
server.use(bodyParser.json());

//Set up a router for all api requests
const apiRouter = require('./api');


//Logging middleware
const morgan = require('morgan');
server.use(morgan('dev'));

//Log request body sent in to endpoint
server.use((req, res, next) => {
    console.log('<___Body Logger START___>');
    console.log(req.body);
    console.log("<___Body Logger End___>");

    next();
});


//Route requests to /api to be processed by router
server.use('/api', apiRouter);

//When script is run, server will listen to PORT
server.listen(PORT, () => {
    console.log(`The server is up on port ${PORT}. Listening...`);
});