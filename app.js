// require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Router = require('./routes/server')
const bcrypt = require('bcrypt');
const session = require("express-session");
const User = require("./models/User");
const morgan = require('morgan')
var cookieParser = require("cookie-parser");
const saltRounds = 6;


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(morgan("dev"));


app.use(cookieParser());

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 6000000,
    },
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});


var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/user");
  } else {
    next();
  }
};


app.get("/", sessionChecker, (req, res) => {
  res.render("home");
});


app
  .route("/signup")
  .get(sessionChecker, (req, res) => {
    res.render("signup");
  })
  .post((req, res) => {

    var user = new User({
      username: req.body.username,
      email: req.body.email,
      password:req.body.password,
    });
    user.save((err, docs) => {
      if (err) {
        res.redirect("/signup");
      } else {
          console.log(docs)
        req.session.user = docs;
        res.render("user", {username: " " + req.body.username});
      }
    });
  });


app
  .route("/signin")
  .get(sessionChecker, (req, res) => {
    res.render("signin");
  })
  .post(async (req, res) => {
      var username = req.body.username;
      var password = req.body.password;

      try {
        var user = await User.findOne({ username: username }).exec();
        if(!user) {
            res.redirect("/signin");
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.render("signin");
            }
        });
        req.session.user = user;
        res.render("user", {username: req.body.username});
    } catch (error) {
      console.log(error)
    }
  });

// route for user's dashboard
app.get("/user", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render("user");
  } else {
    res.redirect("/signin");
  }
});

// route for user logout
app.get("/signout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/signin");
  }
});


app.get("/meat1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("meat1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/vegetables1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("vegetables1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/diary1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("diary1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/spices1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("spices1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/fruits1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("fruits1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/nuts1", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("nuts1");
  } else {
    res.redirect("/signin");
  }
})

app.get("/cart", function(req,res){
  if (req.session.user && req.cookies.user_sid) {
    res.render("cart");
  } else {
    res.redirect("/signin");
  }
})

// Vegetables page
app.get("/vegetables", function(req,res){
  res.render('vegetables.ejs')
})

// fruits page
app.get("/fruits", function(req,res){
  res.render('fruits.ejs')
})

// meat page
app.get("/meat", function(req,res){
  res.render('meat.ejs');
})

// Diary page
app.get("/diary", function(req,res){
  res.render('diary.ejs');
})



app.listen(8000, ()=>{
    console.log("App started at the port 8000");
});