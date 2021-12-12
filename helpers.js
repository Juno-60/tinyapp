const emailLookup = function(inputEmail, database) {
  if (!inputEmail) {
    return undefined;
  }
  for (let id in database) {
    if (database[id].email === inputEmail) {
      return database[id];
    }
  } return false;
};

module.exports = {
  emailLookup,
};