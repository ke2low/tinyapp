
const express = require("express");
const getUserByEmail = require('./helpers.js');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
let visitCount = 0;
let uniqueVisitCount = 0;
const users = {};
const uniqueUserTracker = {};
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "", time: "", visits: "", uniqueVisits: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "", time: "", visits: "", uniqueVisits: "" }
};

let cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["encrypt"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//app is a variable name, you can rename it as something else
app.get("/", (req, res) => {
  if (req.session.user_id  === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// helper functions
const urlsForUser = function(id, database) {
  const filteredURLDatabase = {};
  Object.keys(database).forEach(function(shortURL)  {
    filteredURLDatabase[shortURL] = database[shortURL];
  });
  Object.keys(database).forEach(function(shortURL) {
    if (id !== database[shortURL].userID)  {
      delete filteredURLDatabase[shortURL];
    }
  });
  return filteredURLDatabase;
};

const generateRandomString = function() {
  let randomStringArray = [];
  for (let i = 0; i < 6; i++) {
    if (i % 2 !== 0) {
      randomStringArray.push(String.fromCharCode(Math.floor(Math.random() * 20 + 98)));
    } else {
      randomStringArray.push(String.fromCharCode(Math.floor(Math.random() * 10 + 48)));
    }
  }
  return randomStringArray.join("");
};

const emailCheck = function(address) {
  let emailExists = false;
  Object.keys(users).forEach(function(person) {
    if (address === users[person].email) {
      emailExists = true;
    }
  });
  return emailExists;
};

const passwordCheck = function(address, password)  {
  let passwordCorrect = false;
  Object.keys(users).forEach(function(person) {
    if (address === users[person].email) {
      if (bcrypt.compareSync(password, users[person].password)) {
        passwordCorrect = true;
      }
    }
  });
  return passwordCorrect;
};

const shortURLExists = function(url)  {
  let exists = false;
  Object.keys(urlDatabase).forEach(function(links) {
    if (url === links) {
      exists = true;
    }
  });
  return exists;
};

app.get("/urls", (req, res) => {
  let filteredURLDatabase = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {
    username: users[req.session.user_id],
    urls: filteredURLDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: users[req.session.user_id] };
  if (req.session.user_id  === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let filteredURLDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (shortURLExists(req.params.shortURL) === false) {
    res.status(400).send('Error:400 - Invalid Link');
  }
  let templateVars = {
    username: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urls: filteredURLDatabase
  };

  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id)  {
    res.status(400).send('Error:400 - You may only view urls associated to with own account');
  } else if (urlDatabase[req.params.shortURL].userID === req.session.user_id && shortURLExists(req.params.shortURL))  {
    res.render("urls_show", templateVars);
  } else if (shortURLExists(req.params.shortURL) === false) {
    res.status(400).send('Error:400 - Please login or register.');
  }
});

app.get("/register", (req, res) =>  {
  let templateVars = { username: users[req.session.user_id] };
  if (req.session.user_id  === undefined) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) =>  {
  let templateVars = { username: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id, time: date, visits: visitCount, uniqueVisits: uniqueVisitCount };
  res.redirect(`/u/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  if (shortURLExists(req.params.shortURL))  {
    urlDatabase[req.params.shortURL].visits += 1;
    if (uniqueUserTracker[req.session.user_id] === undefined)  {
      uniqueUserTracker[req.session.user_id] = 1;
      urlDatabase[req.params.shortURL].uniqueVisits += 1;
    } else if (uniqueUserTracker[req.session.user_id] !== undefined && urlDatabase[req.params.shortURL].uniqueVisits === 0) {
      uniqueUserTracker[req.session.user_id] = 1;
      urlDatabase[req.params.shortURL].uniqueVisits += 1;
    }
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else if (shortURLExists(req.params.shortURL) === false) {
    res.status(400).send('Error 401: Invalid link, page not found');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send('Please login to delete URLs');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send('You are only allowed to delete URLs belonging to your account');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res)  =>  {
  if (!req.session.user_id) {
    res.status(400).send('Please login to edit URLs');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send('You are only allowed to edit urls belonging to your account');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) =>  {
  if (!req.body.email || !req.body.password)  {
    res.status(400).send('Please make sure both email and password fields are filled.');
  } else if (!emailCheck(req.body.email)) {
    res.status(403).send('That email is not associated with any account');
  } else if (emailCheck(req.body.email))  {
    if (!passwordCheck(req.body.email, req.body.password)) {
      res.status(403).send('That password is incorrect');
    } else if (passwordCheck(req.body.email, req.body.password))  {
      let userId = getUserByEmail(req.body.email, users);
      req.session.user_id = userId;
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password)  {
    res.status(400).send('Please make sure both email and password fields are filled.');
  } else if (emailCheck(req.body.email)) {
    res.status(400).send('That email already exists');
  } else {
    let userId = generateRandomString();
    req.session.user_id = userId;
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/urls");
  }
});

