//db/seed.js

//Functions for initializing and testing database

/*----------------------------------------------------------------------------Required packages----------------------------------------------------------------------------*/


const {
    client,
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    getUserByEmail,
    getUserById,
    getUserByUsername,
    createActivity,
    getAllActivities,
    updateActivity,
    getActivitiesById,
    getActivitiesByUser,
    getActivitiesByEmail,
    createRoutine,
    updateRoutine,
    getAllRoutines,
    getPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    getAllRoutinesByActivity,
    getRoutineById,
    getAllRoutinesByEmail,
    getPublicRoutinesByEmail,
    addActivityToRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    getAllRoutineActivitiesById
} = require('./index');


/*------------------------------------------------------------------------------- Functions -------------------------------------------------------------------------------*/


//
async function testDB() {
    try{

        console.log('Starting to test database...');


        //users table management functions
        console.log('Calling getAllUsers');
        const users = await getAllUsers();
        console.log('getAllUsers result: ', users);
        
        console.log('Calling getUser');
        const user = await getUser({ username: 'joe_the_bro', password: 'password123' });
        console.log('getUser result: ', user);

        console.log('Calling getUserById');
        const userById = await getUserById(3);
        console.log('getUserById result: ', userById);

        console.log('Calling getUserByEmail');
        const userByEmail = await getUserByEmail('eva_the_bot@example.com');
        console.log('getUserByEmail result: ', userByEmail);

        console.log('Calling getUserByUsername');
        const userByUsername = await getUserByUsername('joe_the_bro');
        console.log('getUserByUsernam result: ', userByUsername);

        console.log('Calling updateUser on user users[0]')
        const updateUserResult = await updateUser(users[0].id, {
            firstname: 'Newname',
            lastname: 'Sogood'
        });
        console.log('updateUser result: ', updateUserResult);


        //activities table management functions
        console.log('Calling getAllActivities');
        const actvities = await getAllActivities();
        console.log('getAllActivities result: ', actvities);

        console.log('Calling updateActivity');
        const activity = await updateActivity(3, {"videoUrl": 'https://www.youtube.com/watch?v=FnRwNZ0M69Q'})
        console.log('updateActivity result: ', activity);

        console.log('Calling getActivitiesById');
        const actvitiesById = await getActivitiesById(2);
        console.log('getActivitiesById result: ', actvitiesById);

        console.log('Calling getActivitiesByUser');
        const actvitiesByUser = await getActivitiesByUser('eva_the_bot')
        console.log('getActivitiesById result: ', actvitiesByUser);

        console.log('Calling getActivitiesByEmail');
        const actvitiesByEmail = await getActivitiesByEmail('duo_lingo@example.com')
        console.log('getActivitiesById result: ', actvitiesByEmail);


        //routines table management functions
        console.log('Calling getAllRoutines');
        const routines = await getAllRoutines();
        console.log('getAllRoutines result: ', routines);

        console.log('Calling getPublicRoutines');
        const publicRoutines = await getPublicRoutines();
        console.log('getPublicRoutines result: ', publicRoutines);

        console.log('Calling getAllRoutinesByUser');
        const allRoutinesByUser = await getAllRoutinesByUser('eva_the_bot');
        console.log('getAllRoutinesByUser result: ', allRoutinesByUser);

        console.log('Calling getPublicRoutinesByUser');
        const publicRoutinesByUser = await getPublicRoutinesByUser('joe_the_bro');
        console.log('getPublicRoutinesByUser result: ', publicRoutinesByUser);

        console.log('Calling getAllRoutinesByActivity');
        const allRoutinesByActivity = await getAllRoutinesByActivity(1);
        console.log('getAllRoutinesByActivity result: ', allRoutinesByActivity);

        console.log('Calling getPublicRoutinesByActivity');
        const publicRoutinesByActivity = await getPublicRoutinesByActivity(1);
        console.log('getPublicRoutinesByActivity result: ', publicRoutinesByActivity);

        console.log('Calling getRoutineById');
        const routineById = await getRoutineById(3);
        console.log('getRoutineById result: ', routineById);

        console.log('Calling getAllRoutinesByEmail');
        const allRoutinesByEmail = await getAllRoutinesByEmail('duo_lingo@example.com');
        console.log('getAllRoutinesByEmail result: ', allRoutinesByEmail);
        
        console.log('Calling getPublicRoutinesByEmail');
        const publicRoutinesByEmail = await getPublicRoutinesByEmail('joe_johnson@example.com');
        console.log('getPublicRoutinesByEmail result: ', publicRoutinesByEmail);

        console.log('Calling updateRoutine');
        const updatedRoutine = await updateRoutine(2, { public: true, name: 'Bboy Fundamentals' });
        console.log('updatedRoutine result: ', updatedRoutine);

        //routine_activities table management functions
        console.log('Calling getAllRoutineActivitiesById')
        const routineActivities = await getAllRoutineActivitiesById(2);
        console.log('getAllRouineActivitiesById result: ', routineActivities);

        console.log('Calling updateRoutineActivity');
        const updatedRoutineActivity = await updateRoutineActivity(2, {duration: 20, count: 3});
        console.log('updateRoutineActivityResult: ', updatedRoutineActivity);

        console.log('Calling destroyRoutineActivity');
        const destroyedActivity = await destroyRoutineActivity(2);
        console.log('destroyRoutineActivity result: ', destroyedActivity);

        console.log('Finished testing database functions!');
    }
    catch(err) {
        console.error(err);
    }
}


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

        console.log('Creating tables...')

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                firstname VARCHAR(255) NOT NULL,
                lastname VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE activities (
                id SERIAL PRIMARY KEY,
                "creatorId" INTEGER REFERENCES users(id) NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                "videoUrl" TEXT
            );
        `);

        await client.query(`
            CREATE TABLE routines (
                id SERIAL PRIMARY KEY,
                "creatorId" INTEGER REFERENCES users(id) NOT NULL,
                "isPublic" BOOLEAN DEFAULT false,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL
            );
        `);

        await client.query(`
        CREATE TABLE routine_activities (
            id SERIAL PRIMARY KEY,
            "routineId" INTEGER REFERENCES routines(id),
            "activityId" INTEGER REFERENCES activities(id),
            count INTEGER,
            duration INTEGER,
        UNIQUE ("routineId", "activityId")
        );
    `);

    console.log('Finished creating tables...')

    }
    catch(err) {
        console.error('Error creating tables! Error: ', err);
        throw err;
    }

}


// Populate user table with initial user data
async function createInitialUsers() {
    
    try{
        
        console.log('Creating initial users...');

        const joe = await createUser({ 
            firstname: 'Joe',
            lastname: 'Johnson',
            email: 'joe_johnson@example.com',
            username: 'joe_the_bro',
            password: 'password123'
        });

        const eva = await createUser({
            firstname: 'Eva',
            lastname: 'FromWallE',
            email: 'eva_the_bot@example.com',
            username: 'eva_the_bot',
            password: 'pewpew'
        });

        const duo = await createUser({
            firstname: 'Duo',
            lastname: 'Bird',
            email: 'duo_lingo@example.com',
            username: 'duo_owl',
            password: 'learnlangs!!'
        });

        console.log('Finished creating initial users...');

    }
    catch(err) {
        console.error("Error creating initial users. Error: ", err);
        throw err;
    }

}


//Populate activities table with initial activity data
async function createInitialActivities() {

    try{

        const [joe, eva, duo] = await getAllUsers();

        console.log('Creating initial activities...');

        const sixStep = await createActivity({ 
            "creatorId": joe.id,
            name: '6-Step',
            description: '"The 6-step is the basic sequence of breakdancing footwork. The dancer uses their arms to support their body above the floor while moving their legs in a circle." - Wikipedia',
            "videoUrl": 'https://www.youtube.com/watch?v=zPdQ1gN7Ngo'
        });

        const CC = await createActivity({ 
            "creatorId": eva.id,
            name: 'CC',
            description: '"Roll on the side of the foot to the toe of the leg you are CCing with. Use the arm that is down to take most of the weight to allow you to roll onto your toe. Stop your momentum with the opposite hand. Turn enough so your hips are straight up and down vs. turning so your butt is in the air." - darrenwong.com',
            "videoUrl": 'https://www.youtube.com/watch?v=lhncYKa6Fds'
        });

        const airFlare = await createActivity({ 
            "creatorId": duo.id,
            name: 'Air Flare',
            description: '"The airflare (or air-flare) refers to an acrobatic movement in which the performer rotates the torso around the vertical axis of their body (extending from the head down vertically) whilst simultaneously traveling in a circular path along a plane parallel with the floor. The feet are not allowed to touch the ground during the execution of this move and both hands are used to execute standard airflares." - wikipedia'
        });

        console.log('Finished creating initial activites...');

    }
    catch(err) {
        console.error("Error creating initial activities. Error: ", err);
        throw err;
    }


}



//Populate routines table with initial routine data
async function createInitialRoutines() {

    try{

        const [joe, eva, duo] = await getAllUsers();

        console.log('Creating initial routines...');

        const bBoyFootwork = await createRoutine({
            "creatorId": joe.id,
            public: true,
            name: "B-Boy Footwork",
            description: "This routine focuses on the fundamentals of footwork that forms one of the foundations of breakdancing."

        })

        const breakdancing = await createRoutine({
            "creatorId": eva.id,
            name: "Breakdancing Fundamentals",
            description: "This routine is composed of techniques that are fundamentals in breakdancing."
        })

        const bBoyPowerMoves = await createRoutine({
            "creatorId": duo.id,
            public: true,
            name: "B-Boy Power Moves",
            description: "This routine focuses on power moves, the flashy side of breakdancing"
        })

        console.log('Finished creating initial activities...');

    }
    catch(err) {
        console.error("Error creating initial routines. Error: ", err);
        throw err;
    }
}


//Place initial activities into initial routines
async function populateInitialRoutines(){

    try{
        
        const { sixStep, CC, airFlare } = await getAllActivities();

        console.log('Populating initial routines...'); 

        await addActivityToRoutine( { "routineId": 1, "activityId": 1, count: 5 } );
        await addActivityToRoutine( { "routineId": 2, "activityId": 1, count: 3 } );
        await addActivityToRoutine( { "routineId": 1, "activityId": 2, count: 8 } );
        await addActivityToRoutine( { "routineId": 2, "activityId": 2, count: 10 } );
        await addActivityToRoutine( { "routineId": 3, "activityId": 3, duration: 5 } );

        console.log('Finished populating initial routines...'); 

    }
    catch(err) {
        console.error("Error populating initial routines. Error: ", err);
        throw err;
    }
}

//Call above functions to re-initialize database
async function rebuildDb() {
    try {
        //Conect client to the database
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialActivities();
        await createInitialRoutines();
        await populateInitialRoutines();

    }
    catch(err) {
        console.error('Error rebuilding database! Error: ', err);
        throw(err);
    }
}


//Connect client to db, drop and re-create tables, populate with initial data, test db (during development), and end client connection to db
rebuildDb()
    // .then(testDB)
    .catch(console.error)
    .finally(() => client.end());
