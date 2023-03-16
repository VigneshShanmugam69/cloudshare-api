//import express from "express";

const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();
const s3Conn = require("@aws-sdk/client-s3");
const { createScanner } = require("typescript");

//import { ListBucketsCommand,DeleteBucketCommand,CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const client = new s3Conn.S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
        secretAccessKey: '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'
    }
});

exports.router.get('/listbuckets', async (req, res) => {
    const command = new s3Conn.ListBucketsCommand({});

    try {
        const { Owner, Buckets } = await client.send(command);
        res.send(Buckets)
    } catch (err) {
        res.send(err);
    }
});


exports.router.get('/createbucket', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.CreateBucketCommand({
        Bucket: payload.Bucket
    });
    try {
        const { Location } = await client.send(command)
        console.log(Location);
        res.send(`${Location} bucket is created`)

    } catch (err) {
        res.send(err);
    }
});

exports.router.get('/deletebucket', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.DeleteBucketCommand({
        Bucket: payload.Bucket
    });

    try {
        const { response } = await client.send(command)
        res.send(`${response}${payload.Bucket} bucket is deleted`)
    } catch (err) {
        res.send(err);
    }

});

// Buckettags task.no:312


exports.router.get('/buckettags', async (req, res) => {
    // async function name(){
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket
    }
    const command = new s3Conn.GetBucketTaggingCommand(input);
    try {
        const response = await client.send(command);
        // console.log(response);
        res.send(response);

    } catch (err) {
        res.send(err);

    }

});

// // ======cross region=====
// exports.router.get('/crossRegion', async (req, res) => {

//     const input = {
//         "Bucket": "cloudstier-gkumar-demo-001"
//     }
//     const command = new s3Conn.GetBucketCorsCommand(input);
//     try {
//         const response = await client.send(command);
//         res.send(response);
//     } catch (err) {
//         console.error(err);
//     }

// }) ;   

// // ------

//==========GetBucketAclCommand +permissions========
// Buckettags task.no:

exports.router.get('/bucketPermissions', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket

    }
    try {
        const command = new s3Conn.GetBucketAclCommand(input);
        const response = await client.send(command);
        res.send(response);
    } catch (err) {
        res.send(err);
    }


});

