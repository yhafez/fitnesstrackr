// api/activities.js

//Handles all requests made to /activities

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


const express = require('express');
const activitiesRouter = express.Router();

const { requireUser, requireActiveUser } = require('./utils.js');
const { getAllActivities, createActivity, getActivitiesById, updateActivity, getPublicRoutinesByActivity } = require('../db');


/*------------------------------------------------------------------------------- End Points -------------------------------------------------------------------------------*/


//Log when a request is being made to /users
activitiesRouter.use((req, res, next) => {
    console.log('A request is being made to /activities');

    next();
});


//Get and return all activities in the database
activitiesRouter.get('/', async (req, res, next) => {

    try{
        const activitiesArr = await getAllActivities();
        
        if(activitiesArr) {
            res.send({
                message: "Successfully fetched all activities in the database. Please see attached.",
                activitiesArr
            });
        }
        else {
            next({
                name: "ActivitiesFetchError",
                message: "There was a problem fetching all the activities from the database."
            });
        }
    }
    catch(err) {
        console.error('Error with GET request to fetch all activities at /api/activities endpoint');
        const { name, message } = err;
        next({ name, message });
    }

});


//Create new activity in database and return it
activitiesRouter.post('/', requireUser, requireActiveUser, async (req, res, next) => {
    

    const creatorId = req.user.id;
    const { name, description, videoUrl } = req.body;

    //Build fields object to pass into createActivity. If optional videoUrl field is not provided, do not include it in the object
    const fields = videoUrl ? { creatorId, name, description, videoUrl } : { creatorId, name, description };

        //If no name or description is provided, notify user and return early
        if(!name || !description) {
            next({
                name: "FieldsMissingError",
                message: "Please provide a name and description for the activity you wish to create."
            });
        }

    try{
        //If all fields present, attempt to create activity. On succeess, return userObj and notify user, else notify user if unsuccessful.
        const activityObj = await createActivity(fields);

        if(activityObj) {
            res.send({
                message: "Activity has been successfully created and added to the database. Please see atached activity object.",
                activityObj
            });
        }
        else{
            next({
                name: "ActivityCreationError",
                message: "There's been an error creating the new activity."
            });
        }

    }
    catch(err) {
        console.error('Error with POST request to create a new activity at /api/activities endpoint');
        const { name, message } = err;
        next({ name, message });
    }
});


//Update an existing activity, if you are the creator, and return updated activity item
activitiesRouter.patch('/:activityId', requireUser, requireActiveUser, async (req, res, next) => {

    const userId = req.body.id;
    const targetActivity = req.params.activityId;
    const fields = req.body;
    
    //TODO - Confirm this works
    //If no update fields provided, return early and notify user
    if(fields.length === 0){
        next({
            name: "MissingFieldsError",
            message: "Please provide a field you wish to update."
        });
    }

    try{
        
        //Attempt to locate activity using id from url
        const activityObj = await getActivitiesById(targetActivity);

        //If no such activity is found, notify user and return early
        if(!activityObj) {
            next({
                name: "ActivityNotFound",
                message: "No activity was found with the specified Id."
            });
        }
        
        //If user attempting to edit activity is not the user who created the activity, send error message
        const activityCreator = activityObj.creatorId;
        if(userId !== activityCreator){
            next({
                name: "UnauthorizedUpdateAttempt",
                message: "Only the user who created the activity may edit it."
            })
        }
        

        //If activity is found and user attempting to edit is the creator, attempt to update activity. If successful, notify user and return updated activity obj, else notify user of update failure
        const updatedActivity = await updateActivity(targetActivity, fields);

        if(updatedActivity){
            res.send({
                message: "Activity successfully updated! Please see attached activity object.",
                updatedActivity
            });
        }
        else {
            next({
                name: "ActivityUpdateError",
                message: "There was a problem updating the activity."
            });
        }

    }
    catch(err) {
        console.error('Error with PATCH request to update existing activity at /api/activities/:activityId endpoint');
        const { name, message } = err;
        next({ name, message });
    }

});


//Return list of all public activities featuring activity whose id is specified in request URL
activitiesRouter.get(':activityId/routine', async (req, res, next) => {
    
    const targetActivity = req.params.activityId;

    try{

        //Attempt to locate activity using id from url
        const activityObj = await getActivitiesById(targetActivity);

        //If no such activity is found, notify user and return early
        if(!activityObj) {
            next({
                name: "ActivityNotFound",
                message: "No activity was found with the specified Id."
            });
        }
        
        //If successful, attempt to get all public routines containing the activity
        const routinesArr = await getPublicRoutinesByActivity(targetActivity);

        //If routine array is successfully fetched from database and has a length greater than 0, send success message with routines array. Else send error message.
        if(routinesArr && routinesArr.length){
            res.send({
                message: "Success fetching public routines containing specified activity. Please see attached routines array.",
                routinesArr
            });
        }
        else{
            next({
                name: "publicRoutinesFetchError",
                message: "There's been an error fetching public routines with a specified activity id."
            })
        }
    
    }
    catch(err) {
        console.error('Error with GET request to fetch list of all public activities with the specified activity at /api/activities/:activityId/routine endpoint');
        const { name, message } = err;
        next({ name, message });
    }

});


/*------------------------------------------------------------------------- End Points - Stretch Goals ---------------------------------------------------------------------*/


//Get a list of all public activities
activitiesRouter.get('/all_public', async (req, res, next) => {

});


//Get a list of all activities logged in user has created
activitiesRouter.get('/all', requireUser, requireActiveUser, async (req, res, next) => {

});


//Get a list of public activities logged in user has created
activitiesRouter.get('/public', requireUser, requireActiveUser, async (req, res, next) => {

});


//getByEmail

//getByUsername


/*-------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = activitiesRouter
