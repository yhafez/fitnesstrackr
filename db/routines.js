//db/routines.js

//Functions for accessing, creating, modifying, and deleting routines table items in database

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


//Require client from users to enable managing DB, and relevant helper functions
const { client, getUserByUsername, getUserByEmail } = require('./users');



/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//Add a new routine to the activities table
async function createRoutine( fields = {} ) {
        
    const { creatorId, public, name, description } = fields;

    try{
        if(public) {
            
            const { rows: routine } = await client.query(`
                INSERT INTO routines("creatorId", public, name, description)
                VALUES (${creatorId}, ${public}, '${name}', '${description}')
                RETURNING *;
            `)

            return routine;
        }
        else{
            const { rows: routine } = await client.query(`
            INSERT INTO routines("creatorId", name, description)
            VALUES (${creatorId}, '${name}', '${description}')
            RETURNING *;
        `)

        return routine;
        }
    }
    catch(err) {
        console.error('Error creating routine. Error: ', err);
        throw err;
    }

}


//Modify stored information about a routine in the activities table; can be used to de-activate/delete and re-activate/un-delete an routine
async function updateRoutine( id, fields = {} ) {

    try{

        //Format setString into a string format that can be passed into PSQL ('"field1"=$1, "field2"=$1', etc.)
        const setString = Object.keys(fields).map((key, index) => `"${ key }"= $${ index + 1 }`).join(', ');

        if(!id || setString.length === 0){
            throw new Error('Missing field. Please provide routineId and a field to update.');
            return;
        }

        const { rows: routine } = await client.query(`
            UPDATE routines
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return routine;

    }
    catch(err) {
        console.error('Error updating routine. Error: ', err);
        throw err;
    }

}


//Get all routine objects
async function getAllRoutines() {

    try{
        
        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines;
        `)

        return routinesArr;
    }
    catch(err) {
        console.error('Error getting all routines. Error: ', err);
        throw err;
    }

}


//Get all routines designated as "public"
async function getPublicRoutines() {

    try{

        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines
            WHERE public=true;
        `)

        return routinesArr;
        
    }
    catch(err) {
        console.error('Error getting public routines. Error: ', err);
        throw err;
    }

}


//Return all routine-objects created by a user with the specified username
async function getAllRoutinesByUser(username) {
    
    try{

        const [{ id }] = await getUserByUsername(username);

        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines
            WHERE "creatorId"=${id};
        `)

        return routinesArr;
        
    }
    catch(err) {
        console.error('Error getting all routines by user. Error: ', err);
        throw err;
    }

}


//Get public routines by the user with the specified username
async function getPublicRoutinesByUser(username) {

    try{

        const [{ id }] = await getUserByUsername(username);

        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines
            WHERE public=true
            AND "creatorId"=${id};
        `)

        return routinesArr;
        
    }
    catch(err) {
        console.error('Error getting public routines by user. Error: ', err);
        throw err;
    }

}


//Returns public routine objects that contain a particular activity
async function getPublicRoutinesByActivity(activityId) {
    
    try{
        
        const {rows: routinesIdArr} = await client.query(`
            SELECT "routineId"
            FROM routine_activities
            WHERE "activityId"=${activityId}
        `)
    
        //Convert routine ID's into routines in the form of a promise object
        const routinesPromiseArr = routinesIdArr.map(async (idObj) => {
            
            const [routine] = await getRoutineById(idObj.routineId);
            
            if(routine.public){
                return routine;
            }
        
        });
        
        //Convert promise object into desired array
        const routinesArr = await Promise.all(routinesPromiseArr);
        
        //Remove "undefined" routines which are those that are not public
        return routinesArr.filter(obj => obj);
        

    }
    catch(err) {
        console.error('Error getting public routines by activity. Error: ', err);
        throw err;
    }

}


/*------------------------------------------------------------------------ Functions - Stretch Goals -----------------------------------------------------------------------*/


//Return the routine object with the specified routineId
async function getRoutineById(routineId) {
    
    try{

        const { rows: routineObj } = await client.query(`
            SELECT *
            FROM routines
            WHERE id=${routineId};
        `)

        return routineObj;
        
    }
    catch(err) {
        console.error('Error getting routines by Id. Error: ', err);
        throw err;
    }

}


//Get all routines designated as public by user with specified email
async function getAllRoutinesByEmail(email) {

    try{

        const [{ id }] = await getUserByEmail(email);

        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines
            WHERE "creatorId"=${id};
        `)

        return routinesArr;
        
    }
    catch(err) {
        console.error('Error getting public routines by user. Error: ', err);
        throw err;
    }

}


//Get all routines designated as public by user with specified email
async function getPublicRoutinesByEmail(email) {

    try{

        const [{ id }] = await getUserByEmail(email);

        const { rows: routinesArr } = await client.query(`
            SELECT *
            FROM routines
            WHERE public=true AND "creatorId"=${id};
        `)

        return routinesArr;
        
    }
    catch(err) {
        console.error('Error getting public routines by user. Error: ', err);
        throw err;
    }

}


//Returns public routine objects that contain a particular activity
async function getAllRoutinesByActivity(activityId) {
    
    try{
        
        const {rows: routinesIdArr} = await client.query(`
            SELECT "routineId"
            FROM routine_activities
            WHERE "activityId"=${activityId}
        `)

        //Convert routine ID's into routines in the form of a promise object
        const routinesPromiseArr = routinesIdArr.map(async (idObj) => await getRoutineById(idObj.routineId));
        
        //Convert promise object into desired array
        const routinesArr = await Promise.all(routinesPromiseArr);

        return routinesArr;

    }
    catch(err) {
        console.error('Error getting public routines by activity. Error: ', err);
        throw err;
    }

}


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = {
    createRoutine,
    updateRoutine,
    getAllRoutines,
    getPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    getRoutineById,
    getAllRoutinesByEmail,
    getPublicRoutinesByEmail,
    getAllRoutinesByActivity
}