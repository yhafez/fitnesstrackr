//api/utils.js


/*------------------------------------------------------------------------------- Middleware -------------------------------------------------------------------------------*/
//Middleware verifying if user is logged in and if logged in user is active


//Verify if user is logged in; if not, notify user
function requireUser(req, res, next) {

    if(!req.user) {
        next({
            name: 'MissingUserError',
            message: 'You must be logged in to perform this action'
        });
    }
    next();
}


//Verify is current user is active; if not notify user
function requireActiveUser(req,res,next) {

    if(!req.user.active){
        next({
            name: 'UserInactiveError',
            message: 'Current user has previously been deactivated'
        })
    }
    next();
}


/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


//Export util functions
module.exports = {
    requireUser,
    requireActiveUser
}