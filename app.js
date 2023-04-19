require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const { response } = require('express');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;
var comments = [];

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phone: String,
    dateOfBirth: {
        month: Number,
        day: Number,
        year: Number
    },
    gender: String
});

const commentSchema = new mongoose.Schema ({
    data: String
});

const Comment = new mongoose.model("comment", commentSchema);

userSchema.plugin(encrypt, {secret: process.env.KEY , encryptedFields: ['lastname'] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("newlogin");
});

app.get("/register", function(req,res){
    res.render("newregister");
});

app.get("/chat", function(req,res){
    
    res.render("mychat", {comments : comments});
})

app.post("/register", function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hash,
            phone: md5(req.body.phone),
            dateOfBirth: {
                month: req.body.month,
                day: req.body.day,
                year: req.body.year
            },
            gender: req.body.gender
        });
        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.render("myaccount");
                
            }
        });
    });

    
});

app.post("/login", function(req,res){
    const username = req.body.email;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        } else{
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result){
                    if(result === true){
                        res.render("myaccount");
                        
                    }
                });
                
            }
        }
    });
});

app.post("/chat", function(req, res){
  const com = req.body.mycomment;
  comments.push(com);
  res.redirect("/chat");
})

app.listen(3000, function(){
    console.log("server is up and running");
});