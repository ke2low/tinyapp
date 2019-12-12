

function getUserByEmail(address, database)  {
  let userId;
  Object.keys(database).forEach(function(person) {
    if (address == database[person].email) {
      userId = database[person].id;
    }
  });
  return userId;
}

module.exports = getUserByEmail;