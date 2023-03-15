"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Users_1 = require("./users");
const Buckets = require("./bucket");
const Objects = require("./objects");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(Users_1.router);
app.use(Buckets.router);
app.use(Objects.router);
app.listen(4201, () => {
    return console.log('CloudShare server started...');
});
