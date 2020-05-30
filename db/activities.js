//db/activities.js

//Functions for accessing, creating, modifying, and deleting activities table items in database

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


//Require client from ./users to enable managing DB, and relevant helper functions
const { client, getUserByUsername, getUserByEmail } = require('./users');


/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//Add a new activity to the activities table
async function createActivity( fields = {} ) {
    

    let { creatorId, name, description } = fields;

    name = name.toLowerCase();
    
    try{
        
        //If no fields are supplied, return early
        if(!name || !description){
            throw new Error('One or more activity field is missing');
            return;
        }

        //If a videourl is included, insert it along with name and description
        if(fields.videoUrl){
            
            const { videoUrl } = fields;

            const { rows: activity } = await client.query(`
                INSERT INTO activities("creatorId", name, description, "videoUrl")
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `, [creatorId, name, description, videoUrl]);

            return activity;
        }
        else {

            const { rows: activity } = await client.query(`
                INSERT INTO activities ("creatorId", name, description)
                VALUES ($1, $2, $3)
                RETURNING *;
            `, [creatorId, name, description]);
            

            return activity;
        }
    }
    catch(err){
        console.error('Error creating activity. Error: ', err);
        throw err;
    }

}


//Get all activity objects
async function getAllActivities() {

    try{
        
        const { rows: activitiesArr } = await client.query(`
            SELECT *
            FROM activities;
        `);
        
        return activitiesArr;

    }
    catch(err) {
        console.error('Error getting all activities. Error: ', err);
        throw err;
    }

}


//Modify stored information about an activity in the activities table; can be used to de-activate/delete and re-activate/un-delete an activity
async function updateActivity( id, fields = {} ) {

    try{

        //Format setString into a string format that can be passed into PSQL ('"field1"=$1, "field2"=$1', etc.)
        const setString = Object.keys(fields).map( (key, index) => `"${ key }"=$${ index + 1 }`).join(', ');
        
        //If activity id is missing or no update fields are povided, return early
        if(!id || setString.length === 0){
            throw new Error('Missing field. Please provide userId and a field to update.');
            return;
        }

        const { rows: [activityObj] } = await client.query(`
            UPDATE activities
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return activityObj;

    }
    catch(err) {
        console.error('Error updating activity. Error: ', err);
        throw err;
    }
}


/*------------------------------------------------------------------------ Functions - Stretch Goals -----------------------------------------------------------------------*/


//Return the activity object with the specified activityId
async function getActivitiesById(activityId){
 
    try{
        
        const { rows: activitiesObj } = await client.query(`
            SELECT *
            FROM activities
            WHERE id=${activityId};
        `);
        
        return activitiesObj;
        
    }
    catch(err) {
        console.error('Error getting activities by id. Error: ', err);
        throw err;
    }

}


//Return all activity-objects created by a user object with the specified username
async function getActivitiesByUser(username) {
    
    try{
        
        const [{ id }] = await getUserByUsername(username);

        const { rows: activitiesArr } = await client.query(`
            SELECT *
            FROM activities
            WHERE "creatorId"=${id};
        `);
        
        return activitiesArr;
        
    }
    catch(err) {
        console.error('Error getting activities by user. Error: ', err);
        throw err;
    }

}



//Return all activity-objects created by a user object with the specified email
async function getActivitiesByEmail(email) {
    
    try{
        
        const [{ id }] = await getUserByEmail(email);

        const { rows: activitiesArr } = await client.query(`
            SELECT *
            FROM activities
            WHERE "creatorId"=${id}
        `);
        
        return activitiesArr;
        
    }
    catch(err) {
        console.error('Error getting actvities by email. Error: ', err);
        throw err;
    }

}


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = {
    createActivity,
    getAllActivities,
    updateActivity,
    getActivitiesById,
    getActivitiesByUser,
    getActivitiesByEmail
}