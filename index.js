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
                "Add a Role",
                "Add a Department",
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

//function to add a department
function addDepartment(){
    inquirer.prompt([
        {
            name:"addDept",
            type: "input",
            message: "What department would you like to add ?",
        }
    ]).then(answer => {
        let qry = "INSERT INTO department (name) VALUES (?)";
        db.query(qry, answer.addDept, (err, result) => {
            if (err) throw err;
            console.log(`Added ${answer.addDept} to departments`);
            viewAllDepartments();
        }); 
    });
}

//function to addRoles
function addRole(){
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What role would you like to add ?",
        },
        {
            type: 'input',
            name: 'salary',
            message: "What is the salary of this role ?",
        }       
    ]).then(answer => {
        const parms = [answer.role, answer.salary];

        //grap dept from department table
        const roleSel = `SELECT name, id FROM department`;
        db.query(roleSel, function(err, data){
            if(err) throw err;
            const dept = data.map(({name, id}) => ({name: name, value: id}));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: "What department would you like to add of this role ?",
                    choices: dept
                }
            ]).then(deptChoice => {
                const dept = deptChoice.dept; //add the value of new dept in dept
                parms.push(dept); //adding role , salary in dept

                const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';

                db.query(sql, parms, (err, result) => {
                    if(err) throw err;
                    console.log('`Added New role to roles!`');
                    viewAllRoles();
                });
            });
        });
    });
};

//function to add employee
function addEmployee(){
    let roleArray = [];
    let empArray = [];
    let qryR = 'SELECT * FROM role';
    db.query(qryR, (err, results) => {
        if (err) throw err;
        let qryE = 'SELECT * FROM employee';
        db.query(qryE, (err, resultsE) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name:"firstname",
                    type:"input",
                    message: "Enter the first name of employee",
                },
                {
                    name:"lastname",
                    type:"input",
                    message: "Enter the last name of employee",
                },
                {
                    name:"role",
                    type:"list",
                    message: "What is the employee's Role",
                    choices: function(){
                        for(let i=0; i< results.length; i++){
                            roleArray.push(results[i].title)
                        }
                        return roleArray;
                    },
                },
                {
                    name:"managerID",
                    type:"list",
                    message: "Who is the employee's Manager ?",
                    choices: function(){
                        for(let j=0; j< resultsE.length; j++){
                            empArray.push(resultsE[j].first_name)
                        }
                        return empArray;
                    },
                },
            ]).then((answer) => {
                let manager_ID = empArray.indexOf(answer.managerID) + 1;
                let role_ID = roleArray.indexOf(answer.role) + 1;
                let qry = "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES( ?, ?, ?, ?)";
                db.query(qry, [answer.firstname, answer.lastname, role_ID, manager_ID],
                    (err, results) => {
                        if (err) throw err;
                        console.log("Employee added successfully");
                        viewAllEmployees();
                    });
            });
        });
    });
}

        
   


