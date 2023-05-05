const authClient = require('@okta/okta-auth-js');
const oktaVerifier = require('@okta/jwt-verifier');
const express = require("express");
const helper = require('./helper/jwt')

exports.router = (express.Router)();

const issuer = 'https://dev-99932483.okta.com/oauth2/default';
const clientID = '0oa96jm6l9Xbt6lmy5d7';
const clientSecret = '';
const apiToken = '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd';

exports.router.post('/authenticateUser', async (req, res) => {
    var response = await authenticateUser(req.body.Username, req.body.Password);
    res.send({ result: response });
});

async function authenticateUser(Username, Password) {
    try {
        var oktaAuth = new authClient.OktaAuth({
            issuer: issuer,
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

exports.router.post('/VerifyAccessToken', async (req, res) => {
    var response = await VerifyAccessTokenByAccessToken(req.body.accessToken);
    res.send({ result: response });
});

async function VerifyAccessTokenByAccessToken(accessToken) {
    try {
        const client = new oktaVerifier({
            issuer: issuer,
            clientId: clientID
        })
        const result = await client.verifyAccessToken(accessToken, 'api://default')
            .then((jwt) => {
                return jwt;
            })
            .catch((err) => {
                return err;
            });
        if (result.parsedBody) {
            let currentTime = Math.floor(Date.now() / 1000); // convert current time to Unix timestamp in seconds
            let expiresIn = 3600;  //seconds
            if (result.parsedBody.exp > currentTime) {
                let obj = {
                    "firstName": result.parsedBody.firstName,
                    "lastName": result.parsedBody.lastName,
                    "email": result.parsedBody.email,
                    "userId": result.parsedBody.userId,
                    "iat": currentTime,
                    "exp": currentTime + expiresIn,
                }
                var response = await helper.createJwtToken(obj);
                return response;
            } else {
                let obj = {
                    "status": 2,
                    "message": "The access token has been expired",
                }
                return obj;
            }
        } else {
            let obj = {
                "status": 0,
                "message": "Invalid token",
            }
            return obj;
        }
    }
    catch (error) {
        return error;
    }
}
