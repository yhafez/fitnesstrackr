const { getAllUsers, createUser, getUser, updateUser } = require('./db');
const axios = require('axios');


//Attempt 1 - works, but if I make it async, doesn't work. Successfully determines that I'm receiving an object, which is really just a promise object.

// describe('getAllUsers()', () => {
    // test('Returns array of user objects', () => {
    //     expect(typeof getAllUsers()).toBe('object');
    // })
// });




//Attempt 2 - Doesn't work at all.

// describe('getAllUsers()', () => {


    // test('Returns array of user objects', async () => {


    //     const await expectedObj = {
    //         id: expect.any(Number),
    //         firstname: expect.any(String),
    //         lasstname: expect.any(String),
    //         email: expect.any(String),
    //         username: expect.any(String),
    //         active: expect.any(Boolean)
    //     }
    //     const expectedArr = [except.objectContaining(expectedObj)]
    //     console.log(expectedObj);

    //     expect(getAllUsers()).toEqual(expect.arrayContaining(expectedArr));
    // })
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






