// api/users.js

//Handles all requests made to /users

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


const express = require('express');
const usersRouter = express.Router();

const { requireUser, requireActiveUser } = require('./utils.js');
const { getUserByUsername, createUser, getPublicRoutinesByUser } = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/*------------------------------------------------------------------------------- End Points -------------------------------------------------------------------------------*/


//Log when a request is being made to /users
usersRouter.use( (req, res, next) => {
    console.log('A request is being made to /users');

    next();
});


//Creates and retunrns new user object
usersRouter.post('/register', async (res, req, next) => {
    console.log("req is ", req);
    console.log("req.body is ", req.body);
    const { firstname, lastname, email, username, password } = req.body;

    try {
        
        //If username already exists, notify user
        const userExists = await getUserByUsername(username);

        if(userExists) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists. Please try another username'
            });
        }
        
        let user, token;

        //Hash and salt password before creating user object in database
        bcrypt.hash(password, 10, async function (err, hashedPassword) {
                    //If username is available, create user and return signed token with success message
            user = await createUser({
                firstname,
                lastname,
                email,
                username,
                password: hashedPassword
            });

            token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });
        });

        //If successful, notify user and return token
        res.send({
            message: 'Thank you for signing up',
            token
        });

    }
    catch(err) {
        console.error('Error in POST request to register a new user at /api/users/register. Error: ', err);
        const { name, message } = err;
        next({ name, message });
    }


});


//Logs in an existing user and returns relevant user object
usersRouter.post('/login', async (res, req, next) => {

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
usersRouter.get('/:username/routines', async (res, req, next) => {

    //Get the target user from the url
    const targetUser = req.params.username;

    try {
        
        //Use targetUser to fetch userObj
        const user = await getUserByUsername(targetUser);
        
        //If username exists, attempt to fetch that user's public routines, else, notify user that specified username cannot be find
        if(user) {

            const routinesArr = await getPublicRoutinesByUser(user);

            //If successfully able to fetch requested user's public routines, and returned array has a length greater than 0, return success message with the array of routines, else, return error message
            if(routinesArr && routinesArr.length){
                res.send({
                    message: `Success. The public routines of ${user.username} are attached`,
                    routinesArr
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


/*------------------------------------------------------------------------- End Points - Stretch Goals ---------------------------------------------------------------------*/


//Get all users
usersRouter.get('/', async (req, res) => {

});


//De-activate existing user, if logged in user is that user
usersRouter.patch('/deactivate', requireUser, requireActiveUser, async (req, res, next) => {

});


//Re-activate a previously deleted/de-activated user, if logged in user is that user
usersRouter.patch('/reactivate', requireUser, async (req, res, next) => {

});


//Permanently delete an existing user, if logged in user is that user
usersRouter.delete('/delete', requireUser, requireActiveUser, async (req, res, next) => {

});

//getByEmail

//getByUsername

//logout??

//Get all users
// usersRouter.get('/', async (req, res) => {
//     const users = await getAllUsers();

//     res.send({
//         users
//     });
// });



// //Login endpoint
// usersRouter.post('/login', async (req, res, next) => {
    
//     //Retrieve and store username and password from API request
//     const { username, password } = req.body;

//     //Verify both a username and password are sent in
//     if(!username || !password) {
//         next({
//             name: 'MissingCredentialsError',
//             message: 'Please supply both a username and password'
//         });
//     }


//     try {
        
//         const user = await getUserByUsername(username);
//         const { id } = user;

//         //Check if user exists and, if so, if entered password matches saved password in db
//         if (user && user.password == password) {

//             //Create a token and return to user
//             const token = jwt.sign({ username, password, id }, process.env.JWT_SECRET)

//             res.send({ message: "You're logged in!", token });
//         }
//         else {
//             //If user doesn't exist or password is incorrect, notify user
//             next({
//                 name: 'IncorrectCredentialsError',
//                 message: 'Username or password is incorrect'
//             });
//         }
//     }
//     catch(err) {
//         console.log(err);
//         next(err);
//     }

// })



// //Delete user
// usersRouter.delete('/:userId', requireUser, requireActiveUser, async (req, res, next) => {
    
//     try{

//         //Get id of user targeted for deletion from request url and see if a user with that id exists.
//         const targetUser = req.params.userId;
//         const user = await getUserById(targetUser);

//         //If user exists, and currently logged in user is that user, attempt to set active status of user to false/deactivate the user.
//         if(user && req.user && req.user.id === +targetUser) {

//             //If user has already been deleted previously, notify user
//             if(user.active === false) {
//                 next({
//                     name: 'UserAlreadyDeleted',
//                     message: 'This user has already been deleted'
//                 })
//             }
            
//             //Else attempt to update user
//             const updatedUser = await updateUser(targetUser, { active: false });

//             //If successful, return updated user object
//             res.send({ updatedUser });

//         }
//         //If user exists, but logged in user is not that user, return an UnauthorizedDeleteAttempt error. If user does not exist, return UserDoesNotExist error.
//         else {
//             next( user ? {
//                 name: 'UnauthorizedDeleteAttempt',
//                 message: 'Only the user can delete their own account'
//             } : {
//                 name: 'UserDoesNotExist',
//                 message: 'The user with that id does not exist'
//             })
//         }
//     }
//     catch ({ name, message }) {
//         next({ name, message });
//     }

// })


// //Reactivate deleted user
// usersRouter.patch('/:userId', requireUser, async (req, res, next) => {

//     try{

//         //Get id of user targeted for reactivation from request url and see if a user with that id exists.
//         const targetUser = req.params.userId;
//         const user = await getUserById(targetUser);

//         //If user exists, and currently logged in user is that user, attempt to set active status of user to true/re-activate the user.
//         if(user && req.user && req.user.id === +targetUser) {

//             //If user is already active, notify user
//             if(user.active === true) {
//                 next({
//                     name: 'UserAlreadyActive',
//                     message: 'This user is not currently deleted/inactive'
//                 })
//             }
            
//             //Else attempt to update user
//             const updatedUser = await updateUser(targetUser, { active: true });

//             //If successful, return updated user object
//             res.send({ updatedUser });

//         }
//         //If user exists, but logged in user is not that user, return an UnauthorizedDeleteAttempt error. If user does not exist, return UserDoesNotExist error.
//         else {
//             next( user ? {
//                 name: 'UnauthorizedDeleteAttempt',
//                 message: 'Only the user can delete their own account'
//             } : {
//                 name: 'UserDoesNotExist',
//                 message: 'The user with that id does not exist'
//             })
//         }
//     }
//     catch ({ name, message }) {
//         next({ name, message });
//     }
// })





/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = usersRouter