//db/routine_activities.js

//Functions for accessing, creating, modifying, and deleting routine_activities table items in database

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


//Require client from users to enable managing DB
const { client } = require('./users');
const { getActivitiesById } = require('./activities');
const { getRoutineById, getPublicRoutinesByActivity, getAllRoutinesByActivity } = require('./routines');


/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//Add activity with specified activityId to routine with specified routineId and update routine_activities table
async function addActivityToRoutine({ routineId, activityId, count, duration }) {
    
    try{
        
        const { rows: routineActivitiesObj } = await client.query(`
            INSERT INTO routine_activities("routineId", "activityId", count, duration)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [routineId, activityId, count, duration]);

        return routineActivitiesObj;

    }
    catch(err) {
        console.error('Error adding activity to routine. Error: ', err);
        throw err;
    }

}


//Modify stored information (count and/or duration) of a routine activity in the routine_activities table
async function updateRoutineActivity( id, fields = {} ) {
    
    try{

        //Format setString into a string format that can be passed into PSQL ('"field1"=$1, "field2"=$1', etc.)
        const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(', ');
        

        if(!id || setString.length === 0){
            throw new Error('Missing field. Please provide routine_activitiesId and a field to update.');
            return;
        }

        const { rows: routineActivitiesObj } = await client.query(`
            UPDATE routine_activities
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return routineActivitiesObj;

    }
    catch(err) {
        console.error('Error updating activity in routine. Error: ', err);
        throw err;
    }

}



//Delete a routine activity in the routine_activities table
async function destroyRoutineActivity(id) {
    
    try{

        const { rows: routineActivitiesObj } = await client.query(`
            DELETE FROM routine_activities
            WHERE id=${id}
            RETURNING *;
        `);

        return routineActivitiesObj;
    }
    catch(err) {
        console.error('Error deleting activity from routine. Error: ', err);
        throw err;
    }

}


/*------------------------------------------------------------------------ Functions - Stretch Goals -----------------------------------------------------------------------*/


//Return an array of routines from the routine with specified routineId
async function getAllRoutineActivitiesById(routineId){
     
    try{
        
        const { rows: activityIdArr } = await client.query(`
            SELECT "activityId"
            FROM routine_activities
            WHERE "routineId"=${routineId};
        `);
 
        const activityPromiseArr = activityIdArr.map(async (idObj) => await getActivitiesById(idObj.activityId));

        const activityArr = Promise.all(activityPromiseArr);
        
        return activityArr;

    }
    catch(err) {
        console.error('Error getting activities from routine. Error: ', err);
        throw err;
    }

}


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = {
    addActivityToRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    getAllRoutineActivitiesById
}