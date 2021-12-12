function emailLookup(inputEmail, database) {
  for (let id in database) {
    if (database[id].email === inputEmail) {
      return database[id];
    }
  } return false;
};

//OLD (works)

// function emailLookup(inputEmail) {
//   for (const user in users) {
//     if (users[user].email === inputEmail) {
//       return users[user];
//     } 
//   } return false;
// };

module.exports = { 
  emailLookup,
}