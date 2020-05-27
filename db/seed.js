//db/seed.js

//Functions for initializing and testing database

/*----------------------------------------------------------------------------Required packages----------------------------------------------------------------------------*/


const {
    client,
    //Other helper functions
} = require('./index');


/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//Delete tables if they exist when re-initializing
async function dropTables() {
    try {
        console.log('Dropping tables...');
        await client.query(`
            DROP TABLE IF EXISTS routine_activities;
            DROP TABLE IF EXISTS routines;
            DROP TABLE IF EXISTS activities;
            DROP TABLE IF EXISTS users;
        `);
        console.log('Finished dropping tables...')
        
    }
    catch(err) {
        console.error('Error dropping tables! Error: ', err);
        throw err;
    }
}


//Create users, activities, routines, and routine_activities tables
async function createTables() {

    try {

        console.lot('Creating tables...')

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE activities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE routines (
                id SERIAL PRIMARY KEY,
                "creatorId" INTEGER REFERENCES users(id),
                public BOOLEAN DEFAULT false,
                name VARCHAR(255) UNIQUE NOT NULL,
                goal TEXT NOT NULL
            );
        `);

    await client.query(`
        CREATE TABLE routine_activities (
            id SERIAL PRIMARY KEY,
            "routineId" INTEGER REFERENCES routines(id),
            "activityId" INTEGER REFERENCES activities(id),
            count INTEGER,
            UNIQUE ("routineId", "activityId")
        );
    `);

    }
    catch(err) {
        console.error('Error creating tables! Error: ', err);
        throw err;
    }

}


//Populate user table with initial user data
// async function createInitialUsers() {

// }


//Populate user table with initial user data
// async function createInitialActivities() {

// }



//Populate user table with initial user data
// async function createInitialRoutines() {

// }


async function rebuildDb() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        // await createInitialUsers();
        // await createInitialActivities();
        // await createInitialRoutines();
    }
    catch(err) {
        console.error('Error rebuilding database! Error: ', err);
        throw(err);
    }
}

rebuildDb()
    .catch(console.error)
    .finally(() => client.end());