const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser')
app.use(cookieParser())


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  // console.log(randomString)
  urlDatabase[shortURL] = req.body.longURL;
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
  const longURL = urlDatabase[req.params.shortURL]; 
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})


app.post("/urls/:shortURL/edit", (req, res)  =>  {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
})

app.post("/login", (req, res) =>  {
  console.log(req.body.username);
  res.cookie("username", req.body.username)
  res.redirect("/urls");
  // res.send(req.body.username);
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})