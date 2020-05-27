//db/index.js

//Create and export client, import and re-export helper functions for managing databse

/*---------------------------------------------------------------------------- Required packages ----------------------------------------------------------------------------*/

//Import client and create a new client using the local DATABASE_URL environmental label (for Heroku) or port 5432 locally
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgress://localhost:5432/fitnesstrackr');

module.exports = {
    client,
//     ...require('./users'), // import helper functions from users.js
//   ...require('./activities'), // import helper functions fromactivites.js
//   ...require('./routines'), // import helper functions from routines.js
//   ...require('./routine_activities') // import helper functions from routine_activities.js
}
