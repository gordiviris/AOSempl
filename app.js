require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const flash = require("connect-flash");
const { allowedNodeEnvironmentFlags } = require("process");
const { error } = require("console");

const app = express();
const PORT = 3000;

//passport creation
require("./config/passport")(passport);

const hbs = exphbs.create({
    helpers:{
        ifEquals: function (arg1, arg2, options) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        },
        formatSalary: (salary) => {
            return `$${parseFloat(salary).toFixed(2)}`;
        },
        formatDate: (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
    }
})

//set handlebars as our templating engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

//sets our static resources folder
app.use(express.static(path.join(__dirname,"public")));

//Middleware body-parser parses json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

//setup express-session middleware
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))

//Setup Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Setup Flash messaging
app.use(flash());

//Global Variables for Flash Messages
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

//required route router example
app.use("/", require("./routes/auth").router);
app.use("/", require("./routes/crud"));

//MongoDB Database connection
const mongoURILocal = "mongodb://localhost:27017/Empl"
const mongoURI = "mongodb+srv://andradekevin01:M4T50TmxZdsUuqMh@aosempl.wxhug.mongodb.net/?retryWrites=true&w=majority&appName=aosempl"
mongoose.connect(mongoURI);
const db = mongoose.connection;
//check for connection
db.on("error", console.error.bind(console, "MongoDB Connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

//-------------------------------------------------------------------------------------

app.get("*",(req, res)=>{
    //res.sendFile(path.join(__dirname, "public", "index.html"));
    res.writeHead(301, {
        "Location": "http://" + req.headers["host"] + "/"
    });
    res.end();
});


//nodemon listener
app.get("/nodemon",(req, res)=>{
    res.sendStatus(500);
});

//Creates Listener on port 3000
app.listen(PORT, ()=>{
    console.log("Server running on port 3000");
})