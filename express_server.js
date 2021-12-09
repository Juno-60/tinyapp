const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// object holding static and generated urls and their shortlinks
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com",
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

// app.get('/hello', (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// main index page
app.get('/', (req, res) => {
  res.send("Hello!");
});

// json database of all created and hard coded urls
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Page that renders all existing URLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
   };
  res.render("urls_index", templateVars)
});

// page for creating new URLs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});

// makes a post request to /urls using the input body longURL from new url page.
app.post("/urls", (req, res) => {
  const newString = generateRandomString();   // generates a new string ID
  urlDatabase[newString] = (req.body.longURL) // assigns a new value to freshly created string
  res.redirect(`/urls/${newString}`);         // Redirect to newly created string page.
});

// results page of newly created string. ":shortURL is an express variable."
app.get("/urls/:shortURL", (req, res) => {
  // allows these objects to be accessible in HTML template
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// sends link off on its way to the wilderness
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // references value of newly generated key
  res.redirect(longURL); // redirects to that key, duh
});

// makes a post request for deletion of assigned :shortURL variable
app.post("/urls/:shortURL/delete", (req, res) => {
  // req.params references the shortURL in the path of the URL
  delete urlDatabase[req.params.shortURL];
  // then redirects to main url list page
  res.redirect('/urls');
});


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // references the value of the key :shortURL
  const longURL = req.body.longURL; // body.longURL is the NAME of the FORM in urls_show
  urlDatabase[shortURL] = longURL;  // replaces object value based on key
  res.redirect(`/urls`) // redirects after 
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});