// api/users.js

//Handles all requests made to /users

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


const express = require('express');
const usersRouter = express.Router();

const { requireUser, requireActiveUser } = require('./utils.js');
const { getUserByUsername, createUser, getPublicRoutinesByUser, getUserByEmail } = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/*------------------------------------------------------------------------------- End Points -------------------------------------------------------------------------------*/


//Log when a request is being made to /users
usersRouter.use( (req, res, next) => {
    console.log('A request is being made to /users');

    next();
});


//Creates and retunrns new user object
usersRouter.post('/register', async (req, res, next) => {
    
    const { firstname, lastname, email, username, password } = req.body;

    try {

        console.log("req.body is ", req.body);

        //If username already exists or email is already in use, notify user
        let userExists = await getUserByUsername(username);

        console.log(userExists)
        if(userExists) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists. Please try another username'
            });
        }

        userExists = await getUserByEmail(email);
        if(userExists) {
            next({
                name: 'EmailAlreadyInUse',
                message: 'There is already a user with that email. Please use another email.'
            });
        }

        //Hash and salt password before creating user object in database
        await bcrypt.hash(password, 10, async function (err, hashedPassword) {
            
            //If username is available, create user and return signed token with success message
            const user = await createUser({
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword
            });

            console.log('user');

            const token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });
            
            //If successful, notify user and return token
            res.send({
                message: 'Thank you for signing up',
                token
            });
     
        });

    }
    catch(err) {
        console.error('Error in POST request to register a new user at /api/users/register. Error: ', err);
        const { name, message } = err;
        next({ name, message });
    }


});


//Logs in an existing user and returns relevant user object
usersRouter.post('/login', async (req, res, next) => {

    const { username, password } = req.body;
    try{
        const user = await getUserByUsername(username);

        if(!user) {
            next({
                name: "InvalidCredentialsError",
                message: 'User does not exist'
            });
        }

        const hashedPassword = user.password;

        bcrypt.compare(password, hashedPassword, function(err, passwordsMatch) {
            
            if(passwordsMatch) {

                const token = jwt.sign({
                    id: user.id,
                    username
                }, process.env.JWT_SECRET, {
                    expiresIn: '1w'
                });

                res.send({
                    message: 'You have successfully logged in',
                    token
                });

            }
            else {
                next({
                    name: "InvalidCredentialsError",
                    message: 'Password entered is incorrect'
                });
            }
        })
    }
    catch(err) {
        console.error('Error in POST request logging in at endpoint /api/users/login. Error: ', err);
        const { name, message } = err;
        next({ name, message });
    }

});


//Gets and returns public routines by username specified in request URL
usersRouter.get('/:username/routines', async (req, res, next) => {

    //Get the target user from the url
    const targetUser = req.params.username;

    try {
        
        //Use targetUser to fetch userObj
        const user = await getUserByUsername(targetUser);
        
        //If username exists, attempt to fetch that user's public routines, else, notify user that specified username cannot be find
        if(user) {

            const routinesArr = await getPublicRoutinesByUser(user.username);

            //If successfully able to fetch requested user's public routines, and returned array has a length greater than 0, return success message with the array of routines. If user exists, but the array length is 0, return message that the user does not have any public routines, else, return error message
            if(routinesArr && routinesArr.length){
                res.send({
                    message: `Success. The public routines of ${user.username} are attached`,
                    routinesArr
                });
            }
            else if (!routinesArr.length){
                next({
                    name: "RoutinesNotFound",
                    message: "The specified user does not have any public routines"
                });
            }
            else{
                next({
                    name: "RoutineFetchError",
                    message: "There's been an error fetching the public routines for the user specified"
                });
            }
        }
        else {
            next({
                name: 'UserDoesNotExist',
                message: 'No user with the specified username found'
            });
        }
    }
    catch(err) {
        console.error(`Error fetching public routines by specified user at endpoint /:username/routines. Error: `, err );
        const { name, message } = err;
        next({ name, message });
    }

});

module.exports = usersRouter