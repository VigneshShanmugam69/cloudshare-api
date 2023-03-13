"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Users_1 = require("./Users");
const Users_2 = require("./Bucket");
const Objects = require("./Objects");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(Users_1.router);
app.use(Users_2.router);
app.use(Objects.router);
app.listen(4201, () => {
    return console.log('CloudShare server started...');
});
