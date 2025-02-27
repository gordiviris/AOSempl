const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const { error } = require("console");

const app = express();
const PORT = 3000;

const hbs = exphbs.create({
    helpers:{
        formatSalary: (salary) => {
            return `$${parseFloat(salary).toFixed(2)}`;
        },
        formatDate: (date) => {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, '0'); 
            const day = String(d.getDate()).padStart(2, '0'); 
            const year = d.getFullYear(); 
            return `${month}/${day}/${year}`;
        }
    }
})

//set handlebars as our templating engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

//sets our static resources folder
app.use(express.static(path.join(__dirname,"public")));

//Middleware body-parser parses json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

//MongoDB Database connection
const mongoURI = "mongodb://localhost:27017/Empl"
mongoose.connect(mongoURI);
const db = mongoose.connection;
//check for connection
db.on("error", console.error.bind(console, "MongoDB Connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

//Mongoose schemma and model
const emplSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    department:String,
    startDate:Date,
    jobTitle:String,
    salary:Number
});

const Employee = mongoose.model("Employee", emplSchema, "employee");

//-------------------------------------------------------------------------------------
//Handle bar pages
//Add new employee
app.get("/", (req, res)=>{
    res.render("index",{
        title: "Add a new Employee",
        message:"Please enter employee's information below."
    })
});

//POST new employee
app.post("/addemployee", async (req,res)=>{ 
    try{
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.redirect('/view');
        // res.status(201).json(savedEmployee);
        
    }catch(err){
        res.status(400).render("index", {
            title: "Add a New Employee",
            message: "Failed to add the employee. Please try again.",
            error: err.message,
        });
    }
});

//-------------------------------------------------------------------------------------

//view all employees
app.get("/view", async (req, res)=>{
    try {
        const employees = await Employee.find().lean(); 
        res.render("view", {
            title: "Employee List",
            message: "List of all Employees",
            employees,
        });
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send("Error fetching employees");
    }
});

//GET all employees
app.get("/viewemployees", async(req,res)=>{  
    try{
        const employees = await Employee.find();
        console.log(employees)
        res.json(employees);
    }catch(err){
        res.status(500).json({error:"Failed to fetch Employee data"})
    }
});

//-------------------------------------------------------------------------------------

//update employee
app.get("/update", (req, res)=>{
    res.render("update",{
        title: "Update Employee Information",
        message:"Update Information below"
    })
});

//PUT update employee
app.put("/updateemployee", async(req,res)=>{
    try{
        const updatedemployee = await Employee.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true
        });
        if (!updatedemployee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json(updatedemployee);
    }catch(err){
        res.status(400).json({error:"Failed to update employee"});
    }
});


//-------------------------------------------------------------------------------------

//delete employee
app.get("/delete", (req, res)=>{
    res.render("delete",{
        title: "Delete Employee",
        message:"Are you sure you want to deletethis employee?"
    })
});

//DELETE employee
app.delete("/deleteemployee", async(req,res)=>{
    try{
        const employeename = req.query;
        const employee = await Employee.find(employeename);

        if(employee.length === 0){
            return res.status(404).json({error:"Failed to find employee"});
        }
        const deletedEmployee = await Employee.findOneAndDelete(employeename);
        res.json({message: "Employee deleted successfully"})
    }catch(err){
        console.error(err);
        res.status(404).json({error:"Employee not found"});
    }
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