"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./Users");
const bucket = require("./bucket");
const objects = require("./Objects");
const folders = require("./folders");
const editObject = require("./edit-objects") 
const authorization=require("./authorization");
const properties=require("./properties");
const systemWallet = require('./systemwallet');
const ssoConfig = require('./sso');
const objectMenu = require('./objectmenu');

const app = express();
const bucketmanagement =require('./bucketmanagement')
app.use(cors());
app.use(bodyParser.json());
app.use(user.router);
app.use(bucket.router);
app.use(objects.router);
app.use(folders.router);
app.use(editObject.router);
app.use(authorization.router);
app.use(properties.router);
app.use(systemWallet.router);
app.use(ssoConfig.router);
app.use(objectMenu.router);
app.use(bucketmanagement.router);
app.listen(4201, () => {
    return console.log('CloudShare server started...');
});
