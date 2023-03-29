// require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/JournlDB');

const secretsSchema = new mongoose.Schema({
  title: String,
  date: Date,
  feedback: String,
  postBody: String
})

// Model
const Secret = mongoose.model('Secret', secretsSchema);


app.get("/", (req,res) => {
  res.render("home.ejs")
})

app.get("/main", (req,res) => {
  res.render("main.ejs")
})

app.get("/compose", (req,res) => {
  res.render("compose.ejs")
})

app.post("/compose", (req,res) =>{
  const newSecret = new Secret({
    title : req.body.postTitle,
    date : req.body.dateGiven,
    feedback : req.body.feedBack,
    details : req.body.postBody
  })

  newSecret.save((err) => {
    if(err) console.log(err);
    else console.log("Secret Added Successfully")
  })
  // console.log({title, date, feedback, details})
})


app.listen(8000, ()=>{
    console.log("App started at the port 8000");
});