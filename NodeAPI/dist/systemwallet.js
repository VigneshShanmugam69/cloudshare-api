const express_1 = require("express");
const AWS = require('aws-sdk');
const connect = require('./dbconnection');
const ejs = require('ejs');
const keytar = require('keytar');
const okta = require('@okta/okta-sdk-nodejs');
exports.router = (0, express_1.Router)();

exports.router.post('/storeTheCredential', async (req, res) => 
{
    try
    {
        const {service,account,password} = req.body;
        keytar.setPassword(service,account,password)
        .then(()=> res.send("Credential stored successfully!"))
        .catch( err => res.send(err));

    }
    catch(err)
    {
        res.status(500).send(err);
    }
});
exports.router.post('/getTheCredential', async (req, res) => 
{
    try
    {
        const {service,account} = req.body;
        keytar.getPassword(service,account)
        .then( password => res.send("Credential found : "+ password))
        .catch( err => res.send(err));

    }
    catch(err)
    {
        res.status(500).send(err);
    }
});
exports.router.delete('/deleteTheCredential', async (req, res) => 
{
    try
    {
        const {service,account} = req.body;
        keytar.deletePassword(service,account)
        .then( () => res.send(true))
        .catch( err => res.send(err));

    }
    catch(err)
    {
        res.status(500).send(err);
    }
});
exports.router.get('/getOktaUsers', async (req, res) => 
{
    try
    {
        const myUsers = [];
        const myCred = new okta.Client({
            orgUrl:'https://dev-70779564-admin.okta.com/',
            token:'009lQeaB5h1DMGLtbuyVMTNfCruR2ABLhgA3lhIkMw'
        });
        myCred.listUsers()
        .each(user =>{
            myUsers.push(user);
        })
        .then(()=> res.send(myUsers))
        .catch( err => res.send(err));

    }
    catch(err)
    {
        res.status(500).send(err);
    }
});