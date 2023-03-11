"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();

exports.router.get('/getUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const values = yield (0, dbconnection_1.connect)();
        const allUsers = yield values.query('select * from newdb.users');
        return res.status(200).json(allUsers[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}));
exports.router.get('/getRole', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const values = yield (0, dbconnection_1.connect)();
        const allRoles = yield values.query('select * from role');
        res.status(200).json(allRoles[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}));
exports.router.post('/verifyUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const name = payload['Name'];
        const password = payload.Password;
        const roleID = payload.RoleID;
        const values = yield (0, dbconnection_1.connect)();
        const user = yield values.query('select users.*,role.Role from users inner join role on role.ID = users.RoleID where users.Name = ? and users.Password = ? and users.RoleID = ?', [name, password, roleID]);
        // array of array of user 
        let userDetails = user[0][0];
        //console.log("newValue====>>  ",userDetails);   -- This is for reference while doing console log
        if (userDetails) {
            let obj = {
                "status": 200,
                "IsVerified": true,
                "message": "User verified successfully",
                "result": userDetails
            };
            res.send(obj);
        }
        else {
            let obj = {
                "status": 404,
                "IsVerified": false,
                "message": "User not found",
                "result": 0
            };
            res.send(obj);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
