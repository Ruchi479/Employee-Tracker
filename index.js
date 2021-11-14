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
                "Update an Employee Role",
                "Update an Employee Manager",
                "View Employees By Department",
                "View Employees By Manager",
                "Delete a Department",
                "Delete a Role",
                "Delete an Employee",
                "View Department Budgets",
                "Quit"
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
            case "Update an Employee Role":
                updateEmployeeRole();
                break;
            case "Update an Employee Manager":
                updateEmployeeManager();
                break;
            case "View Employees By Department":
                viewByDept();
                break;
            case "View Employees By Manager":
                viewByManager();
                break;
            case "Delete a Department":
                deleteDepartment();
                break;
            case "Delete a Role":
                DeleteRole();
                break;
            case "Delete an Employee":
                DeleteEmployee();
                break;
            case "View Department Budgets":
                viewDeptBudget();
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

//function to update an employeeRole
function updateEmployeeRole(){
    let empNameArray =[];
    let qry = "SELECT * FROM employee";
    db.query(qry, (err, results) => {
        if(err) throw err;
        inquirer.prompt([
            {
                name:"employeename",
                type:"list",
                message: "Which employee would you like to update",
                choices: function(){
                    for(let i=0; i < results.length; i++){
                        empNameArray.push(results[i].id + "." + results[i].first_name + " " + results[i].last_name);
                    }
                    return empNameArray;
                }, 
            },
        ]).then((answer) => {
            let empID = empNameArray.indexOf(answer.employeename) + 1;
            updateRole(empID);
        });
    });
}

function updateRole(empID){
    let roleArray2 = [];
    let qry2 = "SELECT * FROM role";
    db.query(qry2, (err, results2) => {
        if(err) throw err;
        inquirer.prompt([
            {
                name:"roletitle",
                type:"list",
                message: "What is the employee's new Role",
                choices: function(){
                    for(let j=0; j< results2.length; j++){
                        roleArray2.push(results2[j].title);
                    }
                    return roleArray2;
                },  
            },
        ]).then((answer) => {
            let newRole = answer.roletitle;
            let roleID = roleArray2.indexOf(newRole) + 1;
            let qry = "UPDATE employee SET role_id = ? WHERE employee.id = ?";
            db.query(qry, [roleID, empID], (err, results) => {
                if(err) throw err;
                console.log("Employee Role Updated");
                console.table(results);
                viewAllEmployees();
            });
        });
    });
}

//function to update manager
function updateEmployeeManager(){
    let emplSel = "SELECT * FROM employee";
    db.query(emplSel, (err, data) => {
        if(err) throw err;
        let employees = data.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value:id}));

        inquirer.prompt([
            {
                type:'list',
                name: 'name',
                message: 'Which employee would you like to update ?',
                choices: employees
            }
        ]).then(answer => {
            const employee = answer.name;
            const parms =[];
            parms.push(employee);

            const managerSel = "SELECT * FROM employee";
            db.query(managerSel, (err, data)=> {
                if(err) throw err;

                let managers = data.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value:id}));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the employee's manager ?",
                        choices: managers
                    }
                ]).then(answer => {
                    const manager = answer.manager;
                    parms.push(manager);

                    let employee = parms[0]
                    parms[0] = manager
                    parms[1] = employee

                    const qry = "UPDATE employee SET manager_id = ? WHERE id = ?";

                    db.query(qry, parms, (err, result) => {
                        if(err) throw err;
                        console.log("Employee has been updated!");
                        viewAllEmployees();
                    });            
                });
            });
        });
    });
}

//function to delete department
function deleteDepartment(){
    let deptArray = [];
    let qry = 'SELECT * FROM department';
    db.query(qry, (err, results) => {
        if(err) throw err;
        inquirer.prompt([
            {
                name:'department',
                type: 'list',
                message: "What department do you want to delete ?",
                choices: function () {
                    for(var i = 0; i< results.length; i++){
                        deptArray.push(results[i].name);
                    }
                    return deptArray;
                },
            },
        ]).then((answer) => {
            let deptID = deptArray.indexOf(answer.department) + 1;
            let qry2 ="DELETE FROM department WHERE id = ?";
            db.query(qry2, [deptID], (err, result2) => {
                if(err) throw err;
                console.log("successfully Department deleted");
                viewAllDepartments();
            });

        });
    });
}

//function to delete role
function DeleteRole(){
    let roleArray = [];
    let qry = 'SELECT * FROM role';
    db.query(qry, (err, results) => {
        if(err) throw err;
        inquirer.prompt([
            {
                name:'role',
                type: 'list',
                message: "What role do you want to delete ?",
                choices: function () {
                    for(var i = 0; i< results.length; i++){
                        roleArray.push(results[i].title);
                    }
                    return roleArray;
                },
            },
        ]).then((answer) => {
            let roleID = roleArray.indexOf(answer.role) + 1;
            let qry2 ="DELETE FROM role WHERE id = ?";
            db.query(qry2, [roleID], (err, result2) => {
                if(err) throw err;
                console.log("successfully Role deleted");
                viewAllRoles();
            });
        });
    });
}

//function to delete employee
function DeleteEmployee(){
    let empArray = [];
    let qry = 'SELECT * FROM employee';
    db.query(qry, (err, results) => {
        if(err) throw err;
        inquirer.prompt([
            {
                name:'emplName',
                type: 'list',
                message: "What Employee do you want to delete ?",
                choices: function () {
                    for(let i = 0; i< results.length; i++){
                        empArray.push(results[i].id + "." + results[i].first_name + " " + results[i].last_name);
                    }
                    return empArray;
                },
            },
        ]).then((answer) => {
            let empID = empArray.indexOf(answer.emplName) + 1;
            let qry2 ="DELETE FROM employee WHERE id = ?";
            db.query(qry2, empID, (err, results2) => {
                if(err) throw err;
                console.log("Successfully Employee deleted");
                viewAllEmployees();
            });
        });
    });
}



        
   


