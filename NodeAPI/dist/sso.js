const authClient = require('@okta/okta-auth-js');
const express = require("express");
exports.router = (express.Router)();

exports.router.post('/authenticateUser', async (req, res) => {
    var response = await authenticateUser(req.body.Username, req.body.Password);
    res.send({ result: response });
});

async function authenticateUser(Username, Password) {
    try {
        var oktaAuth = new authClient.OktaAuth({
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            scopes: ['license:write'],
            cookies: {
                sessionCookie: true
            }
            //clientId: '0oa8fti7ep1F8OW0B5d7',
        });

        var response = await oktaAuth.signInWithCredentials({
            username: Username,
            password: Password
        });

        let obj = {
            "status": 1,
            "message": "User authenticated successfully",
            "userDetails": response
        }
        return obj;

    }
    catch (err) {
        let obj = {
            "status": 0,
            "message": "Invalid username or password",
        }
        return obj;
    }
}