const express = require("express");
const router = express.Router();
const passport = require("passport");
const AppUsers = require("../models/AppUsers");

//Register page
router.get("/register", (req,res)=>{
    res.render("register")
})

//Post route to register users
router.post("/register", async (req,res)=>{
    const {username, password, password2, email} = req.body;
    let errors = []

    //Validation checks
    if(!username || !password || !password2 || !email){
        errors.push({msg:"Please fill all fields."})
    }

    if(password !== password2){
        errors.push({msg:"Passwords do not match."})
    }

    if(password.length<6){
        errors.push({msg:"Passwords must be at least 6 characters."})
    }

    if(errors.length >0){
        return res.render("register", {errors, username, password, password2, email});
    }

    const userExists = await AppUsers.findOne({email});

    if(userExists){
        req.flash("error_msg", "Email for this user already exists.");
        return res.redirect("/register");
    }

    const newAppUser = new AppUsers({username, email, password});
    await newAppUser.save();

    req.flash("success_msg", "You are now a registered user")
    res.redirect("/login");

})

//login page route
router.get("/login", (req,res)=>{
    res.render("login");
});

//Dashboard (Protected Route)
router.get("/dashboard", isAuthenticated, (req,res)=>{
    res.render("dashboard", {user:req.user});
});

//User login
router.post("/login", (req,res,next)=>{
    passport.authenticate("local", {
        successRedirect:"/dashboard",
        failureRedirect: "/login",
        failureFlash:true
    })(req,res,next)
});

//user logout
router.get("/logout", (req,res)=>{
    req.logout(()=>{
        req.flash("success_msg", "You logged out");
        res.redirect("/login");
    })
})

//Middleware function to protect routes
function isAuthenticated(req,res,next){
    //Checks if user is authenticated
    if(req.isAuthenticated()) return next();

    //Sends error and redirects if they are not.
    req.flash("error_msg", "Please login to see this page.");
    res.redirect("/login");
}

module.exports = {router, isAuthenticated};
