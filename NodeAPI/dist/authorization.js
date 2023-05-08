const express_1 = require("express");
const AWS = require('aws-sdk');
const fs = require("fs")
const generator = require('generate-password');
const connect = require('./dbconnection');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const keytar = require('keytar');
const okta = require('@okta/okta-sdk-nodejs');
const jwt = require('jsonwebtoken');
const helper = require('./helper/jwt')
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
        fs.appendFileSync(`${process.env.HOME}/.aws/credential`, crede);
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


// Generate mail
async function mail(email, password, firstname, username) {

    const data = {
        name: firstname,
        passwrd: password,
        username: username
    }

    // Read the HTML content file
    fs.readFile('./templates/mailtemplate.ejs', 'utf8', async (err, template) => {
        if (err) {
            console.error(err);
            return;
        }

        // Render the HTML and Bind data
        const html = ejs.render(template, data);

        // Create the transporter
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vigneshshanmugam9@gmail.com',
                pass: 'exvvlmxdsdlezpnk'
            }
        });

        // Generate the completemail
        var mailOptions = {
            from: 'vigneshshanmugam9@gmail.com',
            to: email,
            subject: 'Sign in password',
            html: html
        };

        // Send mail to the newly created user
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error;
            } else {
                return info;
            }
        });
    });
}

exports.router.post('/createLocalUser', async (req, res) => {
    try {

        // Read the details form body and generate the Random password for he user
        var firstName = req.body.firstname;
        var lastName = req.body.lastname;
        var userName = req.body.username;
        var email = req.body.email;
        var roleID = req.body.roleID;
        var password = generator.generate({ Number: true, length: 10 });

        // connect the database and insert the new user details in user table
        const connection = await (connect.connect)();
        const userexists = await connection.query('select Username from users where Username=?', userName);
        if (!userexists[0][0]) {
            var sql = "INSERT INTO users (Firstname,Lastname,Email,Username,RoleID,Password,IsFirst) VALUES ?";
            var values = [[firstName, lastName, email, userName, roleID, password, true]];
            await connection.query(sql, [values]);

            // Call mail function to send the mail to newly created user
            await mail(email, password, firstName, userName);

            let obj = {
                "status": 1,
                "message": "User created successfully"
            }
            res.send(obj);
        }
        else {
            let obj = {
                "status": 2,
                "message": "Username already exists"
            }
            res.send(obj);
        }
    }
    catch (error) {
        let obj = {
            "status": 3,
            "message": error
        }
        res.send(obj);
    }
});

// Delete local user
exports.router.delete('/deleteLocalUser', async (req, res) => {
    const ID = req.body.id;
    const userName = req.body.username;

    const connection = await (connect.connect)();
    var sql = "delete from cloudshare.users where Id=? and Username=?";
    var values = [ID, userName];
    const deleteUser = await connection.query(sql, values);
    if (deleteUser[0].affectedRows === 0) {
        let obj = {
            "status": 2,
            "message": "Failed to delete user"
        }
        res.send(obj);
    }
    else {
        let obj = {
            "status": 1,
            "message": "User deleted successfully"
        }
        res.send(obj);
    }
});

// Update local user
exports.router.put('/updateLocalUser', async (req, res) => {
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var userName = req.body.username;
    var email = req.body.email;
    var roleID = req.body.roleID;

    const connection = await (connect.connect)();
    var sql = "update cloudshare.users set Firstname=?,Lastname=?,Email=?,RoleID=? where Username=?";
    var values = [firstName, lastName, email, roleID, userName];
    const updateUser = await connection.query(sql, values);
    if (updateUser[0].affectedRows === 0) {
        let obj = {
            "status": 2,
            "message": "Failed to update user"
        }
        res.send(obj);
    }
    else {
        let obj = {
            "status": 1,
            "message": "Updated successfully"
        }
        res.send(obj);
    }
});

// List all locally created users
exports.router.get('/listLocalUsers', helper.verifyJwtToken, async (req, res) => {

    var sql = "select users.*,role.Role from users inner join role on role.ID = users.RoleID ";
    const connection = await (connect.connect)();
    const listUser = await connection.query(sql);
    if (listUser[0]) {
        let obj = {
            "status": 1,
            "users": listUser[0]
        }
        res.send(obj);
    }
    else {
        let obj = {
            "status": 2,
            "users": "Failed to get users"
        }
        res.send(obj);
    }
});

exports.router.put('/resetPasswordByFirstLogin', async (req, res) => {
    try {
        const { Username, Password } = req.body;
        var query = "update cloudshare.users set Password=?,IsFirst=? where Username=?";
        var values = [Password, false, Username]
        const connection = await (connect.connect)();
        const result = await connection.query(query, values);
        if (result[0].affectedRows == 1) {
            let obj = {
                "status": 1,
                "message": "Password updated successfully"
            }
            res.send(obj);
        }
        else {
            let obj = {
                "status": 2,
                "message": "Update failed"
            }
            res.send(obj);
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
});

async function authenticateOktaUser(username, password) {

    const authClient = new okta.Client({
        orgUrl: 'https://dev-99932483.okta.com',
        token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd'
    });
    const createSessionRequest = {
        username: username,
        password: password
    };
    var authUser = await authClient.createSession(createSessionRequest)
        .then(session => {
            return session;
        })
        .catch(err => {
            return false;
        });
    if (authUser != false) {
        var user = await authClient.getUser(authUser.userId);
        const connection = await (connect.connect)();
        var query = "select * from cloudshare.users where Email=?";
        var value = user.profile.email;
        var localAuth = await connection.query(query, value);
        var userDetails = localAuth[0][0];
        if (userDetails) {
            let currentTime = Date.now(); // convert current time to Unix timestamp in seconds
            let expiresIn = 3600;  //seconds
            let userdetails = {
                "firstName": user.profile.firstName,
                "lastName": user.profile.lastName,
                "email": user.profile.email,
                "userId": user.id,
                "iat": currentTime,
                "exp": currentTime + expiresIn,
            }
            return { status: 1, userdetails };
        }
        else {
            let obj = {
                "status": 3,
                "message": "You are not authorized person"
            }
            return obj;
        }
    }
    else {
        let obj = {
            "status": 0,
            "message": "Invalid Credentials"
        }
        return obj;
    }
}

exports.router.post('/auth', async (req, res) => {
    var result = await createJwtToken(req.body.Username, req.body.Password);
    res.send(result);
});
exports.router.post('/verifyauth', async (req, res) => {
    var response = await helper.verifyJwtToken(req);
    res.send(response);
});

async function createJwtToken(Username, Password) {
    var result = await authenticateOktaUser(Username, Password);
    if (result.status == 1) {
        var token = await helper.createJwtToken(result.userdetails);
        //var token = jwt.sign(result.userdetails, secret_key);
        return token;
    }
    else {
        return result;
    }
}

exports.router.get('/listUsers', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            clientId: '0oa91fv3ncEaofktD5d7',
            pkce: true,
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const users = [];
        authClient.listUsers().each(user => {
            users.push({
                id: user.id,
                firstname: user.profile.firstName,
                lastname: user.profile.lastName,
                email: user.profile.email,
                status: user.status
            })
        }).then(() => res.send(users));
    } catch (error) {
        res.send(error.message);
    }
});
