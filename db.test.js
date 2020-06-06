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
    getAllRoutineActivitiesById
} = require('./db');

const faker = require('faker');


const axios = require('axios');


describe('Validation tests', () => {
    test('Expect equality to return true', () => {
        expect(true).toBe(true);
    });
});


describe('Create user test', () => {
    
    test('Expect successful POST request to /register to return a user object', async () => {
        
        const userObj = await fetch('https://localhost:3000/register', POST,
        {
            method: 'POST',
            body: {
                firstname: faker.name.firstName(),
                lastname: faker.name.lastName(),
                email: faker.internet.email(),
                username: faker.internet.userName(),
                password: faker.internet.password()
            }
        });

        console.log(userObj);
        
        expect(userObj.keys).toBe(['firstname', 'lastname', 'email', 'username', 'password']);
            
        expect(typeof userObj.firstname).toBe('string'); //firstname
        expect(typeof userObj.lastname).toBe('string'); //lastname
        expect(typeof userObj.email).toBe('string'); //email
        expect(typeof userObj.username).toBe('string'); //username
        exect(typeof userObj.password).toBe('string'); //password
    
        
    })
})


//Attempt 1 - works, but if I make it async, doesn't work. Successfully determines that I'm receiving an object, which is really just a promise object.

// describe('getAllUsers()', () => {
//     test('Returns array of user objects', async () => {
//         // jest.setTimeout(20000);
//         console.log(getAllUsers);
//         const users = await getAllUsers();
//         console.log(users);

//         expect(true).toBe(true);
//         // expect(typeof users).toBe('object');
//         // expect(Array.isArray(users)).toBe(true);
//     });
// });




//Attempt 2 - Doesn't work at all.

// describe('getAllUsers()', () => {


//     test('Returns array of user objects', async () => {


//         const expectedObj = {
//             id: expect.any(Number),
//             firstname: expect.any(String),
//             lasstname: expect.any(String),
//             email: expect.any(String),
//             username: expect.any(String),
//             active: expect.any(Boolean)
//         }
//         const expectedArr = [except.objectContaining(expectedObj)]
//         console.log(expectedObj);

//         expect(getAllUsers()).toEqual(expect.arrayContaining(expectedArr));
//     })
// });

//         const expectedObj = {
//             id: expect.any(Number),
//             firstname: expect.any(String),
//             lasstname: expect.any(String),
//             email: expect.any(String),
//             username: expect.any(String),
//             active: expect.any(Boolean)
//         }
//         const expectedArr = [except.objectContaining(expectedObj)]
//         console.log(expectedObj);

//         expect(getAllUsers()).toEqual(expect.arrayContaining(expectedArr));
//     })
// });

//         const expectedObj = {
//             id: expect.any(Number),
//             firstname: expect.any(String),
//             lasstname: expect.any(String),
//             email: expect.any(String),
//             username: expect.any(String),
//             active: expect.any(Boolean)
//         }
//         const expectedArr = [except.objectContaining(expectedObj)]
//         console.log(expectedObj);

//         expect(getAllUsers()).toEqual(expect.arrayContaining(expectedArr));
//     })
// });



//Attempt 3 - Doesn't work at await getAllUsers

// describe('getAllUsers()', () => {
//     test('Returns array of user objects', async () => {
        
//         console.log('here1');
//         console.log( await getAllUsers());
//         console.log('here2');

//         expect(Array.isArray(await getAllUsers())).toBe(true);

//         (await getAllUsers()).forEach((userObj) => {
                
//             console.log(userObj);
//             console.log(userObj.keys);
//             console.log(userObj.values);

//             expect(typeof userObj).toBe('object');


//             expect(userObj.keys).toBe(['id', 'firstname', 'lastname', 'email', 'username', 'active']);

//             expect(typeof userObj.values[0]).toBe('number'); //id
//             expect(typeof userObj.values[1]).toBe('string'); //firstname
//             expect(typeof userObj.values[2]).toBe('string'); //lastname
//             expect(typeof userObj.values[3]).toBe('string'); //email
//             expect(typeof userObj.values[4]).toBe('string'); //username
//             expect(typeof userObj.values[5]).toBe('boolean'); //active

//         });
//     });
// });






