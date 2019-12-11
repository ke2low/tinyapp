const express = require("express");
//app is a variable name, you can rename it as something else such as router
const app = express();
const PORT = 8080; // default port 8080

//cookie parser required in order to use req.cookies[]
var cookieParser = require('cookie-parser')
app.use(cookieParser())


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const users = { 

}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "" }
};


//app is a variable name, you can rename it as something else
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//USE OBJECT KEY DELETE OPERATOR, DON'T MAKE A NEW OBJECT
function filterObject(database, id) {
  const filteredURLDatabase = {};
  Object.keys(database).forEach(function(shortURL)  {
    filteredURLDatabase[shortURL] = database[shortURL];
  })
  Object.keys(database).forEach(function(shortURL) {
    if (id != database[shortURL].userID)  {
      delete filteredURLDatabase[shortURL];
    }
  })
  //filteredURLDatabase is undefined for some reason
  console.log("filtered URLS " + filteredURLDatabase)
  return filteredURLDatabase;
}

app.get("/urls", (req, res) => {
  let filteredURLDatabase = filterObject(urlDatabase, req.cookies["user_id"])
  let templateVars = {
    // username: req.cookies["username"], 
    username: users[req.cookies["user_id"]],
    // urls: urlDatabase 
    urls: filteredURLDatabase
  };
  res.render("urls_index", templateVars);
  // if (req.cookies["user_id"]) {
  //   res.render("urls_index", templateVars);
  // } 
  // else {
  //   res.status(400).send('Please login or register first.');
  // }
});

//placeholder id is the shortURL
// app.get("/urls/:id", (req, res) => {
  
// })

app.get("/urls/new", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]] }
  if (req.cookies["user_id"]  == undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

//req.cookies["username"]
app.get("/urls/:shortURL", (req, res) => {
  console.log("urlDatabase: " + urlDatabase)
  let templateVars = { 
    // username: req.cookies["username"]
    username: users[req.cookies["user_id"]], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  // res.render("urls_show", templateVars);

  // idCheck(req.params.shortURL)
  if (urlDatabase[req.params.shortURL].userID != req.cookies["user_id"])  {
    res.status(400).send('Error:400 - Please login or register.');
  } else if (urlDatabase[req.params.shortURL].userID == req.cookies["user_id"])  {
    res.render("urls_show", templateVars);
  } 
});

//req.cookies["username"]
app.get("/register", (req, res) =>  {
  let templateVars = { username: users[req.cookies["user_id"]] }
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) =>  {
  let templateVars = { username: users[req.cookies["user_id"]] }
  res.render("urls_login", templateVars);
})

// function idCheck(shortURL)  {
//   let idMatch = false;
//   Object.keys(users).forEach(function(short) {
//     if (short == shortURL)  {
//       if (short.userID == req.cookies["user_id"]) {
//         idMatch = true;
//       }
//     }
//   })
//   return idMatch;
// }


function generateRandomString() {
  let randomStringArray = [];
  for(let i = 0; i < 6; i++) {
    if (i % 2 != 0) {
      randomStringArray.push(String.fromCharCode(Math.floor(Math.random() * (117 - 98 + 1) + 98)));
    } else {
      randomStringArray.push(String.fromCharCode(Math.floor(Math.random() * (57 - 48 + 1) + 48)))
    }
  }
  return randomStringArray.join("")
}

function emailCheck(address) {
  let emailExists = false
  Object.keys(users).forEach(function(person) {
    // console.log(users[person])
    // console.log("user object" + users.person)
    if (address == users[person].email) {
      emailExists = true;
    }
  });
  return emailExists;
}

function urlsforUser(id)  {
  if (id != req.cookies("user_id")) {
    return false;
  } else {
    let filteredURL = users.filter(function(user) {
      if (user.id == req.cookies("user_id")) {
        return user;
      }
    })
    console.log(filteredURL)
    return filteredURL;
  }
}

function passwordCheck(address, password)  {
  let passwordCorrect = false;
  Object.keys(users).forEach(function(person) {
    if (address == users[person].email) {
      if (password == users[person].password) {
        passwordCorrect = true;
      }
    }
  })
  return passwordCorrect;
}

function userIdFind(address)  {
  let userId;
  Object.keys(users).forEach(function(person) {
    if (address == users[person].email) {
      userId = users[person].id;
    }
  });
  return userId;
}

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  // console.log(randomString)
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  console.log(urlDatabase)
  // console.log(urlDatabase)
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Okay");         // Respond with 'Ok' (we will replace this)
  // console.log(shortURL);
  res.redirect(`/u/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  //req.params was needed
  //An object containing parameter values parsed from the URL path.
  // For example if you have the route /user/:name, then the "name" from the URL path wil be available as req.params.name. This object defaults to {}.
  const longURL = urlDatabase[req.params.shortURL].longURL; 
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.cookies["user_id"] + "WOO" + urlDatabase[req.params.shortURL].userID)
  if (req.cookies["user_id"] != urlDatabase[req.params.shortURL].userID) {
    res.status(400).send('Please login to delete URLs');
  } else {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
  }
})


app.post("/urls/:shortURL/edit", (req, res)  =>  {
  console.log(req.cookies["user_id"] + "WOO" + urlDatabase[req.params.shortURL].userID)
  if (req.cookies["user_id"] != urlDatabase[req.params.shortURL].userID) {
    res.status(400).send('Please login to edit URLs');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL
    res.redirect("/urls");
  }
})

app.post("/login", (req, res) =>  {
  if (!req.body.email || !req.body.password)  {
    console.log("ERRORs")
    res.status(400).send('Please make sure both email and password fields are filled.');
  } else if (!emailCheck(req.body.email)) {
    console.log("ERRORss")
    res.status(403).send('That email is not associated with any account');
  } else if (emailCheck(req.body.email))  {
    if (!passwordCheck(req.body.email, req.body.password)) {
      res.status(403).send('That password is incorrect');
    } else if (passwordCheck(req.body.email, req.body.password))  {
      let userId = userIdFind(req.body.email);
      res.cookie('user_id', userId)
      res.redirect("/urls")
    }
  }
})

app.post("/logout", (req, res) => {
  // res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password)  {
    console.log("ERRORs")
    res.status(400).send('Please make sure both email and password fields are filled.');
  } else if (emailCheck(req.body.email)) {
    console.log("ERRORss")
    res.status(400).send('That email already exists');
  } else {
    let userId = generateRandomString();
    res.cookie('user_id', userId);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password,
    }
    console.log(users);
    res.redirect("/urls")
  }
})
