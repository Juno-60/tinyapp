/*-------------------
 ALL REQUIREMENTS 
--------------------*/

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//-----------------
// HELPER FUNCTIONS
//-----------------

// random number generator
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

// existing email lookup
function emailLookup(inputEmail) {
  for (const user in users) {
    if (users[user].email === inputEmail) {
      return users[user];
    } 
  } return false;
};

// returns urls for which the userID is equal to the ID of currently logged in user
function urlsForUser(id) {
  let urlsById = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlsById[url] = urlDatabase[url];
    } 
  } 
  return urlsById;
}

//-----------------
// DATABASE OBJECTS
//-----------------

// object holding static and generated urls and their shortlinks
// urlDatabase[shortURL][key]
const urlDatabase = {
  "b2xVn2": {
    fullURL: "http://www.lighthouselabs.ca",
    userId: "18230"
  },
  "9sm5xk": {
    fullURL: "http://www.google.com",
    userId: "18230"
  },
};

// holds all the users.
const users = {
  "18230": {
    id: "18230",
    email: "tom@scotland.gov",
    password: "cat",
  },
  "2205": {
    id: "2205",
    email: "jason@njb.net",
    password: "lambo",
  },
};

//--------------
// GET ENDPOINTS
//--------------

// main index page
app.get('/', (req, res) => {
  res.redirect('/urls')
});

// register page
app.get('/register', (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("register", templateVars)
  } else {
    res.redirect('/urls');
  }
});

// login page
app.get('/login', (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("login", templateVars)
  } else {
    res.redirect('/urls');
  }
});

// json database of all created and hard coded urls
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// URLs page, renders all existing urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_index", templateVars)
});

// new url creation page
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.redirect('/login');
  } else {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_new", templateVars);
}
});

// urls_show page for individual URLs, with editor feature
app.get("/urls/:shortURL", (req, res) => {
  // allows these objects to be accessible in HTML template
  console.log(req.params.shortURL);
  const url = urlDatabase[req.params.shortURL];
  if (url) {
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: (url.fullURL),
      user: users[req.cookies["user_id"]],
    };
      res.render("urls_show", templateVars);
    } else {
      res.status(404).send("That URL does not exist!");
    }
});

// sends link off on its way to the wilderness
app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (url) {
    // references value of newly generated key
    const longURL = urlDatabase[req.params.shortURL].fullURL; 
    res.redirect(longURL);
  } else {
    res.status(404).send("That URL does not exist!");
  }
});

//--------------
//POST ENDPOINTS
//--------------

// create a new URL
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(403).send("Cannot create new URL unless signed in!")
  } else {
      const newString = generateRandomString();
      // generates a key for an empty object to be placed inside urlDatabase
      urlDatabase[newString] = {};
      // assigns the shortURL object's fullURL property the value of the longURL form
      urlDatabase[newString].fullURL = (req.body.longURL)
      // assigns the shortURL object the currently signed in user's ID
      urlDatabase[newString].userId = req.cookies["user_id"]
      res.redirect(`/urls/${newString}`);
    }
});

// deletes a url if conditions are met
app.post("/urls/:shortURL/delete", (req, res) => {
  const signedInUser = users[req.cookies["user_id"]];
  // checks that a user cookie exists, and it matches the userid value of the url being deleted
  if (signedInUser && signedInUser.id === urlDatabase[req.params.shortURL].userId) {
    // req.params references the shortURL in the path of the URL
    delete urlDatabase[req.params.shortURL];
    // then redirects to main url list page
    res.redirect('/urls');
  } else {
      res.status(403).send("Cannot delete a URL that isn't your own!")
    }
});

// edit an existing URL
app.post("/urls/:shortURL", (req, res) => {
  const signedInUser = users[req.cookies["user_id"]];
  // references the value of the key :shortURL
  const shortURL = req.params.shortURL;
  // assigns variable the long url from the form in urls_show
  const longURL = req.body.longURL;
  // replaces database object value with the longurl from the form
  if (signedInUser && signedInUser.id === urlDatabase[req.params.shortURL].userId) {
    urlDatabase[shortURL].fullURL = longURL;
    res.redirect(`/urls`)
  } else {
    res.status(403).send("Cannot edit a URL that isn't your own!")
  }
});

// register a new user, with checks for existing accounts and form completion
app.post("/register", (req, res) => {
  const userKey = emailLookup(req.body.email);
  const userId = generateRandomString();
  // check if both fields are filled adequately
  if (req.body.email && req.body.password ) {
    // takes password form body to make a hashed password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    // check if account already exists. if not, creates user object
    if (userKey.email !== req.body.email) {
      users[userId] = {
        id: userId,
        email: req.body.email,
        password: hashedPassword, //req.body.password (OLD)
      };
      res.cookie('user_id', userId);
      res.redirect('/urls');
    } else {
      res.status(400).send("That email address is already registered!");
    }
  } else {
    res.status(400).send("Username or Password fields cannot be empty!");
  }
});

// login page with checks for username and password
app.post("/login", (req, res) => {
  const userKey = emailLookup(req.body.email);
  console.log(bcrypt.compareSync(req.body.password, userKey.password));
  console.log(userKey.password)
  if (req.body.email && req.body.password) {
    if (userKey.email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, userKey.password))/*(userKey.password === req.body.password) OLD*/ {
        res.cookie('user_id', userKey.id)
        res.redirect('/urls');
      } else {
        res.status(403).send("Incorrect Password.");
      }
    } else {
      res.status(403).send("That account does not exist!")
    }
  }
});

// logout page
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

//---------------
// STATUS CHECKER
//---------------

// lets console know when server is up and running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});