// __________________Adding Cookies and Sessions________________npm "passport","passport-local","passport-local-mongoose","express-session"

// require("dotenv").config();
const express = require("express");
const bp = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session"); //______________untracked
const passport = require("passport"); //______________________untracked
const passportLocalMongoose = require("passport-local-mongoose"); //________untracked

const PORT = 8080;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bp.urlencoded({ extended: true }));

app.use(
  //____________________________session setup
  session({
    secret: "ThisOurLittleSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //________________initialize passport
app.use(passport.session()); //___________________passport for managing the sessions

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); //____________hash & salt our passwords,then save the users in mongoDB
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); //______________create a local login strategy
passport.serializeUser(User.serializeUser()); //_____________setup to serailize and deserialize our user
passport.deserializeUser(User.deserializeUser());

// SERIALIZE would involve taking the user's data (such as their username, password,
//  email address, and any other relevant information) and converting it into a format that can be stored or transmitted,
//  such as a JSON or XML file. This serialized data can then be stored in a database, sent over a network, or used for other purposes.

// DESERIALIZE would involve taking the serialized data and converting it back into an in-memory object representation,
//  which can then be used by the application or system. This is typically done when retrieving user data from a database or receiving user data over a network.

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  //___________untracked____________loging out the session
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  //___________untracked
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) => {
  //___________untracked
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          //_______authenticating user and setting up logged in session for them
          res.redirect("/secrets");
        });
      }
    }
  );
  //   bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
  //     const user = new User({
  //       email: req.body.username,
  //       password: hash,
  //     });
  //     user
  //       .save()
  //       .then(() => {
  //         res.render("secrets");
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   });
});

app.post("/login", (req, res) => {
  //___________untracked
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    //________________________________creating login sessions
    if (err) {
      console.log(err);
    } else {
      User.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

  //   const getemail = req.body.username;
  //   const getpass = req.body.password;
  //   User.findOne({ email: getemail })
  //     .then((data) => {
  //       bcrypt.compare(getpass, data.password, (err, dat) => {
  //         //returns bool value
  //         if (dat) {
  //           res.render("secrets");
  //         } else {
  //           res.render("login");
  //         }
  //       });
  //     })
  //     .catch((error) => {
  //       console.log("Email Not found");
  //     });
});

app.listen(PORT, () => {
  console.log(`Server At : http://localhost:${PORT}`);
});
