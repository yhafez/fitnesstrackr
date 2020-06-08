// api/routine_activities.js

//Handles all requests made to /routine_activities

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/


const express = require('express');
const routineActivitiesRouter = express.Router();

const { requireUser, requireActiveUser } = require('./utils.js');
const { updateRoutineActivity, destroyRoutineActivity, getRoutineActivityById, getRoutineById } = require('../db');


/*------------------------------------------------------------------------------- End Points -------------------------------------------------------------------------------*/


//Log when a request is being made to /users
routineActivitiesRouter.use((req, res, next) => {
    console.log('A request is being made to /routine_activities');

    next();
});


//Update count or duration of a routine activity logged in user has created it
routineActivitiesRouter.patch('/:rotuineActivityId', requireUser, requireActiveUser, async (req, res, next) => {
    
    const userId = req.user.id;
    const targetRoutineActivity = req.params.rotuineActivityId;
    const fields = req.body;

    try{
        //Attempt to locate routine activity using id from Url
        const routineActivityObj = await getRoutineActivityById(targetRoutineActivity);
        
        //If no such routine activity is found, notify user and return early
        if(!routineActivityObj){
            next({
                name: "RoutineActivityNotFound",
                message: "No such routine activity was found with the specified Id."
            });
        }
        
        const routineObj = await getRoutineById(routineActivityObj.routineId);
        console.log('routineObj is ', routineObj)

        //If user attempting to add activity to routine is not the user who created the routine, send error message
        const routineCreator = routineObj.creatorId;
        if(userId !== routineCreator){
            next({
                name: "UnauthorizedModificationAttempt",
                message: "Only the user who created the routine may add a new activity to it."
            });
        }

        
        const routineActivitiesObj = await updateRoutineActivity(targetRoutineActivity, fields);

        //If activity is successfully added to routine, notify user and return routineActivities object, else notify user of failure
        if(routineActivitiesObj) {
            res.send({
                message: "Activity successfully added to routine! See attached routineActivities object.",
                routineActivitiesObj
            });
        }
        else{
            next({
                name: "RoutineActivitiesAdditionError",
                message: "There was an error attempting to add the specified activity to the specified routine."
            });
        }

    }
    catch(err) {
        console.error("Error with PATCH request to update a routine activity  at /api/routine_activities/:routineActivityId. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }
});


//Hard delete a routine activity logged in user has created it
routineActivitiesRouter.delete('/:rotuineActivityId', requireUser, requireActiveUser, async (req, res, next) => {
    
    const userId = req.user.id;
    const targetRoutineActivity = req.params.rotuineActivityId;

    try{

        //Attempt to locate routine activity using id from Url
        const routineActivityObj = await getRoutineActivityById(targetRoutineActivity);
        
        //If no such routine activity is found, notify user and return early
        if(!routineActivityObj){
            next({
                name: "RoutineActivityNotFound",
                message: "No such routine activity was found with the specified Id."
            });
        }
        
        const routineObj = await getRoutineById(routineActivityObj.routineId);

        //If user attempting to delete activity from routine is not the user who created the routine, send error message
        const routineCreator = routineObj.creatorId;
        if(userId !== routineCreator){
            next({
                name: "UnauthorizedModificationAttempt",
                message: "Only the user who created the routine may delete an activity from it."
            });
        }

        const routineActivitiesObj = await destroyRoutineActivity(targetRoutineActivity);

        //If activity is successfully deleted from routine, notify user and return routineActivities object, else notify user of failure
        if(routineActivitiesObj) {
            res.send({
                message: "Activity successfully deleted from routine! See attached routineActivities object.",
                routineActivitiesObj
            });
        }
        else{
            next({
                name: "RoutineActivitiesDeletionError",
                message: "There was an error attempting to deleted the specified activity from the specified routine."
            });
        }

    }
    catch(err) {
        console.error("Error with DELETE request to delete a routine activity  at /api/routine_activities/:routineActivityId. Error: ", err);
        const { name, message } = err;
        next ({ name, message });
    }

});



/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = routineActivitiesRouter