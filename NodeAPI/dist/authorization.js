const express_1 = require("express");
const AWS = require('aws-sdk');
const fs = require("fs")
exports.router = (0, express_1.Router)();
const credentials = new AWS.SharedIniFileCredentials();
AWS.config.credentials = credentials;
const iamUser = new AWS.IAM();




// Add creadentials to ~/.aws/credential file
exports.router.post('/addProfiles', (req, res) => {

    const crede = `
${[req.body.profileName]} 
aws_access_key_id = ${req.body.accessKey} 
aws_secret_access_key = ${req.body.secretAccessKey}`
    try {
        fs.appendFileSync(`${process.env.HOME}/.aws/credentials`, crede);
        let obj = {
            "status": 1,
            "message": "Credentials saved successfully"
        };
        res.send(obj);

    }
    catch (ex) {
        let obj = {
            "status": 2,
            "message": ex.message
        };
        res.send(obj);
    }
});

// List the users in specified Account
exports.router.get('/listUser', (req, res) => {
    iamUser.listUsers((err, data) => {
        if (!err) {
            let obj = {
                "status": 1,
                "message": "Existing user list",
                "Users": data.Users
            };
            res.send(obj);
        }
        else {
            let obj = {
                "status": 2,
                "message": err
            };
            res.send(obj);
        }
    });
});





// Create new user if the user doedn't exists
exports.router.post('/createUser', async (req, res) => {

    let params = {
        UserName: req.body.username
    };

    iamUser.getUser(params, function (err, data) {
        if (err && err.code === 'NoSuchEntity') {
            iamUser.createUser(params, function (err, data) {
                if (!err) {
                    let obj = {
                        "status": 1,
                        "message": "User created successfully",
                        "userdetails": data
                    }
                    res.send(obj);
                }
                else {
                    let obj = {
                        "status": 2,
                        "message": err
                    }
                    res.send(obj);
                }
            });
        }
        else {
            let obj = {
                "status": 3,
                "message": ("User " + req.query.username + " already exists UserId= " + data.User.UserId)
            }
            res.send(obj);
        }
    });
});


// Delete the user in specified Account
exports.router.delete('/deleteuser', (req, res) => {
    let params = {
        UserName: req.body.username
    };
    iamUser.getUser(params, function (err, data) {
        if (err && err.code === 'NoSuchEntity') {
            let obj = {
                "message": ("User " + req.query.username + " doesn't exists ")
            }
            res.send(obj);
        }
        else {
            iamUser.deleteUser(params, function (err, data) {
                if (!err) {
                    let obj = {
                        "status": 1,
                        "message": "User deleted successfully",
                        "userdetails": data
                    }
                    res.send(obj);
                }
                else {
                    let obj = {
                        "status": 2,
                        "message": err
                    }
                    res.send(obj);
                }
            });

        }

    });
});

