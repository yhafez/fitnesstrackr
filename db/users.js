//db/users.js

//Functions for accessing, creating, modifying, and deleting user table items in database

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


//Require client and create a new client using the local DATABASE_URL environmental label (for Heroku) or port 5432 locally to enable managing DB
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgress://localhost:5432/fitnesstrackr');


/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//Add a new user to the user table; stores hashed password
async function createUser({
    firstname,
    lastname,
    email,
    username,
    password
}) {

    try {

        //Throw missing fields error and return early if a field is missing
        if(!firstname || !lastname || !email || !username || ![password]){
            
            throw new Error('One or more user field is missing');
            return;
        
        }

        const{ rows } = await client.query(`
            INSERT INTO users(firstname, lastname, email, username, password)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
            RETURNING *;
        `, [firstname, lastname,  email, username, password]);

        return rows;

    }
    catch(err) {

        console.error('Error creating user. Error: ', err);
        throw err;
    
    }
}


//Get user object; verifies password against the hashed password
async function getUser( { username, password } ) {
    
    try{
        
        const { rows: userObj } = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1
            AND password=$2;
        `, [username, password]);

        userObj.password='Hidden 😛';

        return userObj;
        
        //TODO
        //Return token?
    }
    catch(err) {
        console.error('Error getting user. Error: ', err);
        throw err;
    }

}



/*------------------------------------------------------------------------ Functions - Stretch Goals -----------------------------------------------------------------------*/
//Return all users currently stored in the user table in the database
async function getAllUsers() {

    try{
        
        const { rows: usersArr } = await client.query(`
            SELECT *
            FROM users;
        `); 

        usersArr.forEach((obj) => obj.password='Hidden 😛');

        return usersArr;

    }
    catch(err) {

        console.error('Error getting all users. Error: ', err);
        throw err;

    }
    
}


//Modify stored information about a user in the user table; can be used to de-activate/delete and re-activate/un-delete users
async function updateUser(id, fields = {}) {

    //Format setString into a string format that can be passed into PSQL ('"field1"=$1, "field2"=$1', etc.)
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    //Return early if this function is called without any fields to update or without a provided id
    if (!id || setString.length === 0) {
        return;
    }

    //Use setString to update user information in database and return updated user object
    try {
        const { rows: [userObj] } = await client.query(`
            UPDATE users
            set ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
        
        userObj.password='Hidden 😛';
        return userObj;
    }
    catch(err) {
        console.error('Error updating user. Error: ', err);
        throw err;
    }

}


//Get user object; verifies password against the hashed password
async function getUserByUsername( username ) {
    
    try{
        
        const { rows: userObj } = await client.query(`
            SELECT *
            FROM users
            WHERE username='${username}'
        `);

        username.password='Hidden 😛';

        return userObj;
        
    }
    catch(err) {
        console.error('Error getting user. Error: ', err);
        throw err;
    }

}


//Return the user object of the user with the specified userId
async function getUserById(userId) {
    try{
        
        const { rows: userObj } = await client.query(`
            SELECT *
            FROM users
            WHERE id=$1;
        `, [userId]);

        userObj.password='Hidden 😛';

        return userObj;
        
    }
    catch(err) {
        console.error('Error getting user. Error: ', err);
        throw err;
    }
}


//Return the user object of the user with the specified email
async function getUserByEmail(email) {
    
    try{
        
        const { rows: userObj } = await client.query(`
            SELECT *
            FROM users
            WHERE email=$1;
        `, [email]);

        userObj.password='Hidden 😛';

        return userObj;
        
    }
    catch(err) {
        console.error('Error getting user. Error: ', err);
        throw err;
    }
}


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = {
    client,
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    getUserById,
    getUserByEmail,
    getUserByUsername
}