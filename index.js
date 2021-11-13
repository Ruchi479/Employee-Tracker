//import and require inquirer
const inquirer = require('inquirer');

//import and require mysql2
const mysql = require('mysql2');

//import console.table
const consoleTable = require('console.table');

//connect to database
const db = mysql.createConnection({
    host: 'localhost',
    //mysql username
    user: 'root',
    password: '123456789',
    database:'employee_db'
});

db.connect((err) => {
    if(err) throw err;
    console.log('Connected to the employee_db database.')
    startPrompt();
});

//initial prompt function
function startPrompt(){
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            message: "What would you like to do ?",
            choices: [
                "View all Employees By Departments",
                "View all Roles",
                "View all Employees",
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "Update an Employee role",
                "Quit",
            ],
        }
    ]).then((answer) => {
        switch (answer.choice) {
            case "View all Employees By Departments":
                viewAllDepartments();
                break;
            case "View all Roles":
                viewAllRoles();
                break;
            case "View all Employees":
                viewAllEmployees();
                break;
            case "Add a Department":
                addDepartment();
                break;
            case "Add a Role":
                addRole();
                break;
            case "Add an Employee":
                addEmployee();
                break;
            case "Update an Employee role":
                updateEmployeeRole();
                break;
            case "Quit":
                exitPrompt();
                break;
        }
    });
}

// Query database to view all departments
function viewAllDepartments(){
    db.query('SELECT department.id AS ID, employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;', function(err,results){
        if (err) throw err;
        console.table(results);
        startPrompt();
    });
}

//view all Roles function
function viewAllRoles(){
    let qry = 'SELECT role.id AS Role_ID, role.title AS Title, role.salary AS Salary, department.name AS Department FROM role INNER JOIN department ON role.department_id = department.id';
    db.query(qry, function(err,results){
        if (err) throw err;
        console.table(results);
        startPrompt();
    });
}

//view all Employee function
function viewAllEmployees(){
    let qry = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT (manager.first_name, " ", manager.last_name) AS Manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id';
    db.query(qry, function(err,results){
        if (err) throw err;
        console.table(results);
        startPrompt();
    });
}


        
   


