const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee"); // Import the Employee model
const { isAuthenticated } = require("./auth"); // Import the isAuthenticated middleware

// CRUD routes for employees
router.use(isAuthenticated);

// GET route to render the "add employee" page
router.get("/", (req, res) => {
    res.render("index", {
        title: "Add a new Employee",
        message: "Please enter employee's information below.",
    });
});

// POST route to add a new employee
router.post("/addemployee", async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.redirect("/view");
    } catch (err) {
        res.status(400).render("index", {
            title: "Add a New Employee",
            message: "Failed to add the employee. Please try again.",
            error: err.message,
        });
    }
});

// GET route to view all employees
router.get("/view", async (req, res) => {
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

// GET route to fetch all employees (API endpoint)
router.get("/viewemployees", async (req, res) => {
    try {
        const employees = await Employee.find();
        console.log(employees);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch Employee data" });
    }
});

// GET route to render the "update employee" page
router.get("/update/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).lean();
        res.render("update", {
            title: "Update Employee Information",
            message: "Update the information below",
            employee,
        });
    } catch (err) {
        res.status(500).send("Error fetching employee data");
    }
});

// POST route to update an employee
router.post("/update/:id", async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEmployee) {
            return res.status(404).send("Employee not found");
        }
        res.redirect("/view");
    } catch (err) {
        res.status(400).render("update", {
            title: "Update Employee",
            message: "Failed to update employee. Please try again.",
            error: err.message,
            employee: req.body,
        });
    }
});

// GET route to delete an employee
router.get("/delete/:id", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).send("Employee not found");
        }
        res.render("delete", {
            title: "Delete Employee",
            message: "Employee deleted successfully!",
        });
    } catch (err) {
        res.status(500).send("Error deleting employee");
    }
});

module.exports = router;