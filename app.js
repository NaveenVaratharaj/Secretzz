// require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Router = require('./routes/server')
const bcrypt = require('bcrypt');
const session = require("express-session");
const User = require("./models/Main");
var cookieParser = require("cookie-parser");
const saltRounds = 6;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(cookieParser());

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
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
    res.redirect("/main");
  } else {
    next();
  }
};

//Journal Schema
const journalSchema = new mongoose.Schema({
  title: String,
  content: String,
  feedback: String,
  date: String
});

const Journal = mongoose.model("Journal", journalSchema);

//Date value Generation
var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 
    
    if(mm<10) 
    {
        mm='0'+mm;
    } 
    today = mm+'-'+dd+'-'+yyyy;

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
        res.redirect("/main");
      }
    });
  });


app
  .route("/signin")
  .get(sessionChecker, (req, res) => {
    res.render("signin");
  })
  .post(async (req, res) => {
      var email = req.body.email;
      var password = req.body.password;

      try {
        var user = await User.findOne({ email: email }).exec();
        if(!user) {
            res.redirect("/signin");
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.render("signin");
            }
        });
        req.session.user = user;
        res.redirect("/main");
    } catch (error) {
      console.log(error)
    }
  });
  text="Welcome back user 👋 Scroll down for memories ⚡";


// route for user's dashboard
app.get("/main", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    Journal.find({}, (err,result) => {
      if(err){
        console.log(err)
      }
      else{
        res.render("main", {memories: result})
      }
    })
  } else {
    res.redirect("/signin");
  }
});


//Route for compose page
app.get("/compose", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render("compose", {todayDate:today});
  } else {
    res.redirect("/signin");
  }
});

// Post Compose
app.post("/compose", function(req, res) {   
  const journ = new Journal({
      title: req.body.postTitle,
      content: req.body.postBody,
      feedback:req.body.feedBack,
      date: today
    });

    journ.save(function(err){
      if (!err){
          res.redirect("/main");
      }
    });

});


app.get("/secrets/:postId", function(req, res){

  const requestedPostId = req.params.postId;
    Journal.findOne({_id: requestedPostId}, function(err, jour){
      res.render("secrets", {
        title: jour.title,
        content: jour.content
      });
    });

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


app.listen(8000, ()=>{
    console.log("App started at the port 8000");
});