const { assert } = require('chai');

const getUserByEmail  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    
    assert.equal(user, expectedOutput);
  });
  it('should return undefined since email does not exist', function() {
    const user = getUserByEmail("hello@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});