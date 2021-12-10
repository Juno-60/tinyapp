/*-------------------
 ALL REQUIREMENTS 
--------------------*/

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
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

//-----------------
// DATABASE OBJECTS
//-----------------

// object holding static and generated urls and their shortlinks
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com",
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
  res.send("Hello!");
});

// register page
app.get('/register', (req, res) => {
  if (!req.cookies["user_id"]) {
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
  if (!req.cookies["user_id"]) {
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
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_index", templateVars)
});

// new url creation page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  } else {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_new", templateVars);
}
});

// results page of newly created string. ":shortURL is an express variable."
app.get("/urls/:shortURL", (req, res) => {
  // allows these objects to be accessible in HTML template
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// sends link off on its way to the wilderness
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // references value of newly generated key
  res.redirect(longURL); // redirects to that key, duh
});

//--------------
//POST ENDPOINTS
//--------------

// - creates a new URL
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(403).send("Cannot create new URL unless signed in!")
  } else {
  const newString = generateRandomString();   // generates a new string ID
  urlDatabase[newString] = (req.body.longURL) // assigns a new value to freshly created string
  res.redirect(`/urls/${newString}`);         // Redirect to newly created string page.
  }
});

// - makes a post request for deletion of assigned :shortURL variable
app.post("/urls/:shortURL/delete", (req, res) => {
  // req.params references the shortURL in the path of the URL
  delete urlDatabase[req.params.shortURL];
  // then redirects to main url list page
  res.redirect('/urls');
});

// basically just the urls_show page's editor feature
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // references the value of the key :shortURL
  const longURL = req.body.longURL; // body.longURL is the NAME of the FORM in urls_show
  urlDatabase[shortURL] = longURL;  // replaces object value based on key
  res.redirect(`/urls`) // redirects after 
});

// register a new user, with checks for existing accounts and form completion
app.post("/register", (req, res) => {
  const userKey = emailLookup(req.body.email);
  const userId = generateRandomString();
  if (req.body.email && req.body.password ) {
    if (userKey.email !== req.body.email) {
      users[userId] = {
        id: userId,
        email: req.body.email,
        password: req.body.password,
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
  if (req.body.email && req.body.password) {
    if (userKey.email === req.body.email) {
      if (userKey.password === req.body.password) {
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