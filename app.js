// require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/SecretsDB');

const postSchema = {
  postTitle: String,
  dateGiven: Date,
  postBody: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", (req,res) => {
  res.render("home.ejs")
})

app.get("/secrets", (req,res) => {
  Post.find({}, function(err, posts){
   res.render("main", {
     secrets: posts
    });
 })
})

app.get("/secrets/:secretsBrief", (req,res) =>{
  const reqTitle = _.lowerCase(req.params.secretsBrief);
  console.log(reqTitle)

  // Post.forEach((secret)=>
  // {
  //   const storedTitle =  _.lowerCase(secret.postTitle);
  //   // console.log(storedTitle)
  //   const storedDetails = secret.postBody;

  //   var secretPost = {
  //     storedTitle : secret.postTitle,
  //     storedDetails : secret.postBody
  //   }
    
  //   if(storedTitle === reqTitle)
  //   {
  //     res.render("secret.ejs", {secrets: secretPost});
  //   }
  //   else console.log("Not found")
  // })

  Post.findOne({postTitle: reqTitle}, function(err, post){
    res.render("secret", { 
      secret:
      {
        storedTitle : post.postTitle,
        storedDetails : post.postBody
      }
    });
  });
})

app.get("/compose", (req,res) => {
  res.render("compose.ejs")
})

app.post("/compose", (req,res) =>{
  var userData =
  {
    postTitle : req.body.postTitle,
    dateGiven : req.body.dateGiven,
    postBody : req.body.postBody
  };

  // secrets.push(userData);
  var post = new Post(userData)
  post.save();
  res.redirect('/secrets');
})

app.get("/main", (req,res) =>
{
  res.render("main");
})

app.listen(8000, ()=>{
    console.log("App started at the port 8000");
});