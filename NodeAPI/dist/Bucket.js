//import express from "express";

const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();
const s3Conn = require("@aws-sdk/client-s3")

//import { ListBucketsCommand,DeleteBucketCommand,CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const client = new s3Conn.S3Client({
    apiVersion: '0.1', region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIA6HCJB5CURVIR3QW7',
        secretAccessKey: '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'
    }
});

exports.router.get('/listbuckets', async (req, res) => {
    const command = new s3Conn.ListBucketsCommand({});
    console.log("command==>>", command)
    try {
        const { Owner, Buckets } = await client.send(command);
        console.log("bucket==>", Buckets)
        console.log("owner==>", Owner)

        res.send(Buckets)
    } catch (err) {
        console.error(err);
    }
});


exports.router.get('/createbucket', async (req, res) => {
    const command = new s3Conn.CreateBucketCommand({
        Bucket: "cloudstier-marulkumar-demo-003",

    });
    try {
        const { Location } = await client.send(command)
        console.log(Location);
        res.send(`${Location} bucket is created`)

    } catch (err) {
        console.error(err);
    }
});

exports.router.get('/deletebucket', async (req, res) => {
    const command = new s3Conn.DeleteBucketCommand({
        Bucket: "cloudstier-marulkumar-demo-003",
    });

    try {
        const { response } = await client.send(command)
        res.send(` bucket is deleted`)
    } catch (err) {
        console.error(err);
    }

});