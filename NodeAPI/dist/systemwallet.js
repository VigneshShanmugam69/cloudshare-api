const express_1 = require("express");
const AWS = require('aws-sdk');
const connect = require('./dbconnection');
const ejs = require('ejs');
const keytar = require('keytar');
const okta = require('@okta/okta-sdk-nodejs');
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
            issuer: 'https://dev-33160744.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const groups = [];
        const userId = req.body.userId;
        authClient.listUserGroups(userId)
            .each(group => { groups.push(group.profile); })
            .then(() => res.send(groups))
    }
    catch (error) {
        res.send(error);
    }
});

exports.router.post('/getAllGroups', async (req, res) => {
    try {
        const authClient = new okta.Client({
            orgUrl: 'https://dev-99932483.okta.com',
            issuer: 'https://dev-33160744.okta.com/oauth2/default',
            token: '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd',
            redirectUri: 'http://127.0.0.1:4201/callback'
        });
        const userGroups = [];
        authClient.listGroups()
            .each(group => { userGroups.push(group.profile); })
            .then(() => res.send(userGroups))
    }
    catch (error) {
        res.send(error);
    }
});
