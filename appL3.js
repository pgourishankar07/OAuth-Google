// ______________________________Encrypting password using #md5 Algorithm _________npm"md5__________
// require("dotenv").config();
const express = require("express");
const bp = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5"); //for encryption
const PORT = 8080;

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//for encryption u are giving a code of string
// var secret = process.env.SECRETS;

// the plugin being registered is encrypt, which is a custom plugin that encrypts specific fields in the document before saving it to the database.
// "secret" -- which is a secret key used for encrypting the data
// "encryptFields" -- which is an array of field names that need to be encrypted

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bp.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const user = new User({
    email: req.body.username,
    password: md5(req.body.password), //for encryption
  });
  user
    .save()
    .then(() => {
      res.render("secrets");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/login", (req, res) => {
  const getemail = req.body.username;
  const getpass = md5(req.body.password); //for encryption

  User.findOne({ email: getemail })
    .then((data) => {
      if (data.password === getpass) {
        res.render("secrets");
      } else {
        res.render("login");
      }
    })
    .catch((error) => {
      console.log("Email Not found");
    });
});

app.listen(PORT, () => {
  console.log(`Server At : http://localhost:${PORT}`);
});
