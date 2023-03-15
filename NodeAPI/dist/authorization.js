const express_1 = require("express");
const AWS = require('aws-sdk');
exports.router = (0, express_1.Router)();
const credentials = new AWS.SharedIniFileCredentials();
AWS.config.credentials = credentials;
const iamUser = new AWS.IAM();





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
exports.router.post('/createUser',async (req, res) => {
    
    let params={
        UserName :req.body.username
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
