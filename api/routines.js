// api/routines.js

//Handles all requests made to /routines

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


const express = require('express');
const routinesRouter = express.Router();

const { requireUser, requireActiveUser } = require('./utils.js');
const { getAllRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, addActivityToRoutine, getRoutineByName } = require('../db');


/*------------------------------------------------------------------------------- End Points -------------------------------------------------------------------------------*/


//Log when a request is being made to /users
routinesRouter.use((req, res, next) => {
    console.log('A request is being made to /routines');

    next();
});


//Get and return all routines
routinesRouter.get('/', async (req, res, next) => {

    try{
        const routinesArr = await getAllRoutines();
        
        if(routinesArr) {
            res.send({
                message: "Successfully fetched all routines in the database. Please see attached.",
                routinesArr
            });
        }
        else {
            next({
                name: "RoutinesFetchError",
                message: "There was a problem fetching all the activities from the database."
            });
        }
    }
    catch(err) {
        console.error('Error with GET request to fetch all routines at /api/routines endpoint');
        const { name, message } = err;
        next({ name, message });
    }
});


//Create a new routine and return routine object
routinesRouter.post('/', requireUser, requireActiveUser, async (req, res, next) => {

    const creatorId = req.user.id;
    const { isPublic, name, description } = req.body;
    
    console.log('req.body is ', req.body);

    //If no name or description is provided, notify user and return early
    if(!name || !description) {
        next({
            name: "FieldsMissingError",
            message: "Please provide a name and description for the routine you wish to create."
        });
    }

    try {
        
        const routineExists = await getRoutineByName(name);
        if(routineExists){
            next({
                name: "RoutineAlreadyExists",
                message: "A routine by this name already exists. Please refer to that routine or use a different name."
            })
        }

        const routineObj = await createRoutine({ creatorId, isPublic, name, description });

        if(routineObj) {
            res.send({
                message: 'Success creating new routine. Routine object attached.',
                routineObj
            });
        }
        else {
            next({
                name: "RoutineCreationError",
                message: "There was a problem attempting to create the new routine. There may be another routine with that name."
            });
        }
    }
    catch(err) {
        console.error("Error with POST request to create a routine at /api/routines. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }
});


//Update an existing routine if you are the creator, and return updated routine object
routinesRouter.patch('/:routineId', requireUser, requireActiveUser, async (req, res, next) => {

    const userId = req.user.id;
    const targetRoutine = req.params.routineId;
    const fields = req.body;

    try{
        
        //TODO - Confirm this works
        //If no update fields provided, return early and notify user
        if(fields.length === 0){
            next({
                name: "MissingFieldsError",
                message: "Please provide a field you wish to update."
            });
        }

        //Attempt to locate routine using id from Url
        const routineObj = await getRoutineById(targetRoutine);

        //If no such routine is found, notify user and return early
        if(!routineObj){
            next({
                name: "RoutineNotFound",
                message: "No routine was found with the specified Id."
            });
        }
        

        //If user attempting to edit routine is not the user who created the routine, send error message
        const routineCreator = routineObj.creatorId;
        if(userId !== routineCreator){
            next({
                name: "UnauthorizedUpdateAttempt",
                message: "Only the user who created the routine may edit it."
            });
        }

        //If routine is found and user attempting to edit is the creator, attempt to update routine. If successful, notify user and return updated routine obj, else notify user of update failure
        const updatedRoutine = await updateRoutine(targetRoutine, fields);

        if(updatedRoutine){
            res.send({
                message: "Routine successfully updated! Please see attached activity object.",
                updatedRoutine
            });
        }
        else{
            next({
                name: "RoutineUpdateError",
                message: "There was a problem attempting to update the specified routine."
            });
        }
    }
    catch(err) {
        console.error("Error with PATCH request to update a routine at /api/routines/:routineId. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }

});


//Delete an existing routine if you are the creator, and return updated routine object
routinesRouter.delete('/:routineId', requireUser, requireActiveUser, async (req, res, next) => {
    
    const userId = req.user.id;
    const targetRoutine = req.params.routineId;

    try{

        //Attempt to locate routine using id from Url
        const routineObj = await getRoutineById(targetRoutine);

        //If no such routine is found, notify user and return early
        if(!routineObj){
            next({
                name: "RoutineNotFound",
                message: "No routine was found with the specified Id."
            });
        }

        //If user attempting to delete the routine is not the user who created the routine, send error message
        const routineCreator = routineObj.creatorId;
        if(userId !== routineCreator){
            next({
                name: "UnauthorizedDeleteAttempt",
                message: "Only the user who created the routine may delete it."
            });
        }

        const deletedRoutineObj = await destroyRoutine(targetRoutine);

        //If routine is deleted successfully, notify user and return the routine object that was deleted, else notify user of error
        if (deletedRoutineObj){
            res.send({
                message: "Activity deleted successfully. The attached routine object was successfully deleted from the database.",
                deletedRoutineObj
            });
        }
        else{
            next({
                name: "RoutinesDeletionError",
                message: "There was a problem attempting to delete the specified routine."
            })
        }

    }
    catch(err) {
        console.error("Error with DELETE request to delete a routine at /api/routines/:routineId. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }
    
});


//Attach a single activity into a routine the user has created
routinesRouter.post('/:routineId/activities', requireUser, requireActiveUser, async (req, res, next) => {

    const userId = req.user.id;
    const targetRoutine = req.params.routineId;
    const { activityId, count, duration } = req.body;

    try{

        //Attempt to locate routine using id from Url
        const routineObj = await getRoutineById(targetRoutine);
        
        //If no such routine is found, notify user and return early
        if(!routineObj){
            next({
                name: "RoutineNotFound",
                message: "No routine was found with the specified Id."
            });
        }

        //If user attempting to add activity to routine is not the user who created the routine, send error message
        const routineCreator = routineObj.creatorId;
        if(userId !== routineCreator){
            next({
                name: "UnauthorizedModificationAttempt",
                message: "Only the user who created the routine may add a new activity to it."
            });
        }

        //If no activity is specified, or both count and duration are missing, notify user of error and return early
        if(!activityId || !(count || duration)) {
            next({
                name: "MissingFieldsError",
                message: "Please provide an activity Id you would like to add to the routine and a count, duration, or both ."
            });
        }

        const routineActivitiesObj = await addActivityToRoutine({ routineId: targetRoutine, activityId, count, duration });

        //If activity is successfully added to routine, notify user and return routineActivities object, else notify user of failure
        if(routineActivitiesObj) {
            res.send({
                message: "Activity successfully added to routine! See attached routineActivities object.",
                routineActivitiesObj
            })
        }
        else{
            next({
                name: "RoutineActivitiesAdditionError",
                message: "There was an error attempting to add the specified activity to the specified routine. The specified activity may already exist in the routine."
            });
        }

    }
    catch(err) {
        console.error("Error with POST request to attach an activity to a routine at /api/routines/:routineId/activities. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }

});


module.exports = routinesRouter

