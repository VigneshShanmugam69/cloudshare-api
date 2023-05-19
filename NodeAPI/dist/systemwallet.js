const express_1 = require("express");
const AWS = require('aws-sdk');
const connect = require('./dbconnection');
const ejs = require('ejs');
const generator = require('generate-password');
const keytar = require('keytar');
const okta = require('@okta/okta-sdk-nodejs');
const mail = require('./email');
exports.router = (0, express_1.Router)();

exports.router.post('/storeTheCredential', async (req, res) => {
    try {
        const { service, account, password } = req.body;
        keytar.setPassword(service, account, password)
            .then(() => res.send("Credential stored successfully!"))
            .catch(err => res.send(err));

    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.router.post('/getTheCredential', async (req, res) => {
    try {
        const { service, account } = req.body;
        keytar.getPassword(service, account)
            .then(password => res.send("Credential found : " + password))
            .catch(err => res.send(err));

    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.router.delete('/deleteTheCredential', async (req, res) => {
    try {
        const { service, account } = req.body;
        keytar.deletePassword(service, account)
            .then(() => res.send(true))
            .catch(err => res.send(err));

    }
    catch (err) {
        res.status(500).send(err);
    }
});

exports.router.post('/getUserGroups', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const groups = [];
        const userId = req.body.userId;
        authClient.listUserGroups(userId)
            .each(group => { groups.push({ groupName: group.profile.name, groupId: group.id }); })
            .then(() => res.send(groups))
    }
    catch (error) {
        res.send(error);
    }
});

exports.router.get('/getAllGroups', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const userGroups = [];
        authClient.listGroups()
            .each(group => { userGroups.push({ groupName: group.profile.name, groupId: group.id }); })
            .then(() => res.send(userGroups))
    }
    catch (error) {
        res.send(error);
    }
});

// List all users from group
exports.router.post('/listGroupUsers', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const groupName = req.body.groupName;
        const users = [];
        for (const name of groupName) {
            var groupId;
            await authClient.listGroups({ q: name }).each(group => { groupId = (group.id); });
            const groupusers = authClient.listGroupUsers(groupId);
            await groupusers.each(user => {
                users.push({
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    email: user.profile.email,
                    userId: user.id
                });
            });
        }
        let obj = {
            "status": 1,
            "message": "users found",
            "response": users
        }
        res.send(obj);
    }
    catch (error) {
        let obj = {
            "status": 0,
            "message": "user not found",
            "response": error.message
        }
        res.send(obj);
    }
});

//Sync all users from one group to local database
exports.router.post('/syncUserToApplication', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const groupname = req.body.groupname;
        var groupId;
        await authClient.listGroups({ q: groupname }).each(group => { groupId = (group.id); });
        const groupusers = authClient.listGroupUsers(groupId);
        const users = [];
        await groupusers.each(user => { users.push(user.profile); });

        // Sync users from OKTA to local database
        for (const user of users) {
            var firstName = user.firstName;
            var lastName = user.lastName;
            var userName = user.login;
            var email = user.email;
            var roleID = 1; //user or admin
            var password = generator.generate({ Number: true, length: 10 });

            // connect the database and insert the new user details in user table
            const connection = await (connect.connect)();
            var sql = "INSERT INTO users (Firstname,Lastname,Email,Username,RoleID,Password,IsFirst) VALUES ?";
            var values = [[firstName, lastName, email, userName, roleID, password, true]];
            await connection.query(sql, [values]);
            await mail.mail(email, password, firstName, userName);
        }
        let obj = {
            "status": 1,
            "message": "User synced successfully"
        }
        res.send(obj);
    }
    catch (err) {
        let obj = {
            "status": 2,
            "message": "Failed to sync user"
        }
        res.send(obj);
    }
});


exports.router.post('/importUsers', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        var groupId = req.body.groupId;
        var userId = req.body.userId;
        for (const groupid of groupId) {
            const group = await authClient.getGroup(groupid)
            var users = []
            const a = await group.listUsers().each(user => {
                users.push({
                    id: user.id,
                    firstname: user.profile.firstName,
                    lastname: user.profile.lastName,
                    email: user.profile.email,
                    status: user.status
                });
            })
            for (const user of userId) {
                for (const userinfo of users) {
                    if (userinfo.id == user) {
                        const connection = await (connect.connect)();
                        var selectQuery = "select * from directoryusers where UserId=?";
                        var userid = user;
                        var userInfo = await connection.query(selectQuery, user);
                        if (userInfo[0].length == 0) {
                            var sql = "INSERT INTO directoryusers (Firstname,Lastname,UserId,Email,Status,ADGroup) VALUES ?";
                            var values = [[userinfo.firstname, userinfo.lastname, userinfo.id, userinfo.email, userinfo.status, group.profile.name]];
                            await connection.query(sql, [values]);
                        }
                        else {
                            let groupNames=group.profile.name + ',' + userInfo[0][0].ADGroup;
                            let updateQuery="update directoryusers set Firstname=?,Lastname=?,Email=?,Status=?,ADGroup=? where UserId=?";
                            let values=[userinfo.firstname, userinfo.lastname, userinfo.email, userinfo.status, groupNames,userInfo[0][0].UserId];
                            await connection.query(updateQuery,values);
                        }

                    }
                }
            }
        }

        let obj = {
            "status": 1,
            "message": "Users imported successfully"
        }
        res.send(obj);
    }
    catch (err) {
        let obj = {
            "status": 2,
            "message": "Failed to import user"
        }
        res.send(obj);
    }
});

