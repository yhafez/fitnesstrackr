//db/index.js

//Export helper functions for managing databse



/*------------------------------------------------------------------------------- Exports -------------------------------------------------------------------------------*/


module.exports = {
  ...require('./users'), // import helper functions from users.js
  ...require('./activities'), // import helper functions fromactivites.js
  ...require('./routines'), // import helper functions from routines.js
  ...require('./routine_activities') // import helper functions from routine_activities.js
}