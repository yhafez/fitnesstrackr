// @ts-nocheck
const {
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
    getAllRoutineActivitiesById,
} = require('./db');

const faker = require('faker');
const axios = require('axios');


//Require client and create a new client using the local DATABASE_URL environmental label (for Heroku) or port 5432 locally to enable managing DB
const { Client } = require('pg');
const client = new Client('postgress://localhost:5432/fitnesstrackr');

beforeAll(() =>{
    client.connect();
    
});

afterAll(() => {
    client.end();
});

describe.skip('Validation tests', () => {
    test('Expect equality to return true', () => {
        expect(true).toBe(true);
    });
});


/*------------------------------------------------------------------------------ Users endpoint ----------------------------------------------------------------------------*/


// /register
describe.skip('/users/register endpoint - create a new user object', () => {
    
    let dat, err;
    const fields = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password()
    }

    //Run once before all tests
    beforeAll(async () => {
        response  = await axios.post('http://localhost:3000/api/users/register', fields);
        data = response.data;
    });


    //On success
    it('returns a user object attached as "data" on success', async () => {expect(typeof data).toBe("object")}),
    test('the object has keys "message" and "token" on success', () => {expect(Object.keys(data)).toEqual(expect.arrayContaining(['message', 'token']))}),
    test('the values of thise keys are of the type "string"', () => {
        expect(typeof data.message).toBe('string');
        expect(typeof data.token).toBe('string');
    }),
    
    //On failure - duplicate user creation attempt
    it('returns an error message in "data" for duplicate user creation attempt', async () => {
        //Run POST call again with same data
        const { data: temp }  = await axios.post('http://localhost:3000/api/users/register', fields);
        err = temp;
        expect(typeof err).toBe("object");
    }), 
    test('the object has keys "name" and "message"', () => {expect(Object.keys(err)).toEqual(expect.arrayContaining(['name', 'message']))}),
    test('the value of "name" is "UserExistsError" and the value of "message" is "A user by that username already exists. Please try another username"', () => {
        expect(err.name).toBe('UserExistsError');
        expect(err.message).toBe("A user by that username already exists. Please try another username");
    })
    
    it('returns an error message in "data" for all other errors', async () => {
        //Run POST call again with same data
        const { data: temp1 }  = await axios.post('http://localhost:3000/api/users/register', {firstname: null, lastname: null, email: null, username: null, password: null});
        expect(typeof temp1).toBe("object");
    })

})



// /login
