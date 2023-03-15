"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const user = require("./Users");
const bucket = require("./Bucket");
const objects = require("./Objects");
const authorization=require("./authorization");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(user.router);
app.use(bucket.router);
app.use(objects.router);
app.use(authorization.router);
app.listen(4201, () => {
    return console.log('CloudShare server started...');
});
