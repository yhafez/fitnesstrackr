// api/index.js

//Main entry point to API. Routes requests appropriately and sets user if token is sent in header.

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/

//Require and configure dotenv, allowing use of .env file
require('dotenv').config();

//Require express and set up another router to route to /users, /activities, /routines, and /routine_activities
const express = require('express');
const apiRouter = express.Router();

//Pull private key from .env for verifying tokens
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


/*------------------------------------------------------------------------------- Middleware -------------------------------------------------------------------------------*/


//Set 'req.user' if authorized
// apiRouter.use(async (req, res, next) => {
//     const prefix = 'Bearer ';
//     const auth = req.header('Authorization');

//     if (!auth) {
//         next();
//     }
//     else if (auth.startsWith(prefix)) {
//         const token = auth.slice(prefix.length);
        
//         try {
//             const { id } = jwt.verify(token, JWT_SECRET);
    
//             if(id) {
//                 req.user = await getUserById(id);
//                 next();
//             }
//         }
//         catch ({ name, message }) {

//             next({ name, message });

//         }
//     }
//     else {
//         next({
//             name: 'AuthorizationHeaderError',
//             message: `Authorization token must start with ${prefix}`
//         });
//     }
// });


//Log that user is set in server terminal if logged in
// apiRouter.use((req, res, next) => {
//     if(req.user) {
//         console.log('User is set: ', req.user);
//     }
//     next();
// });


/*--------------------------------------------------------------------------------- Routers ---------------------------------------------------------------------------------*/

//Route requests to /users, /activities, /routines, and 
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

const routineActivitiesRouter = require(./'routine_activities');
apiRouter.use('/routine_activities', routineActivitiesRouter);


//Export router
module.exports = apiRouter;