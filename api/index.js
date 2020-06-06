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

//Import getUserById from ../db/users.js (through index.js)
const { getUserById } = require('../db');


/*------------------------------------------------------------------------------- Middleware -------------------------------------------------------------------------------*/


//Notify user if server is up and healthy
apiRouter.get('/health', (req, res, next) =>{
    
    res.send({
        message: "Server is healthy"
    })

}); 

//Set 'req.user' if authorized
apiRouter.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    //If not authorization, user is not logged in, so don't set req.user
    if(!auth){
        next();
    }

    else if (auth.startsWith(prefix)) {
        //Remove prefix and any extra blank spaces for verification step
        const token = auth.slice(prefix.length);

        try{
            //Verify token using hidden private key
            const { id } = jwt.verify(token, JWT_SECRET);

            //If able to verify token with JWT, set req.user and log in server terminal; else notify user
            if(id) {
                req.user = await getUserById(id);
                console.log('User is set: ', req.user);
                next();
            }
            else {
                next({
                    name: 'InvalidToken',
                    message: 'The token sent in with the authorization failed to verify. Please try again.'
                })
            }
        }
        catch(err) {
            console.error('Error setting req.user. Error: ', err);
            const { name, message } = err;
            next({ name, message })
        }
    }
    //If header is incorrectly formatted, notify user
    else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    }
});



/*--------------------------------------------------------------------------------- Routers ---------------------------------------------------------------------------------*/


//Route requests to /users, /activities, /routines, and 
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

const routineActivitiesRouter = require('./routine_activities');

apiRouter.use('/routine_activities', routineActivitiesRouter);


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


//Export router
module.exports = apiRouter;