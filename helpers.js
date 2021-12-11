function emailLookup(inputEmail, database) {
  for (const user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  } 
};

//OLD
// existing email lookup
// function emailLookup(inputEmail) {
//   for (const user in users) {
//     if (users[user].email === inputEmail) {
//       return users[user];
//     } 
//   } return false;
// };

module.exports = { 
  emailLookup 
}