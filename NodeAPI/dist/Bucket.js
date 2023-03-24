//import express from "express";

const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();
const s3Conn = require("@aws-sdk/client-s3");
const { createScanner } = require("typescript");
const s3control = require("@aws-sdk/client-s3-control")

//import { ListBucketsCommand,DeleteBucketCommand,CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const client = new s3Conn.S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
        secretAccessKey: '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'
    },

});

const control = new s3control.S3ControlClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
        secretAccessKey: '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'
    }
});

// ========listbuckets========
exports.router.get('/listbuckets', async (req, res) => {
    const command = new s3Conn.ListBucketsCommand({});

    try {
        const { Owner, Buckets } = await client.send(command);
        res.send(Buckets)
    } catch (err) {
        res.send(err);
    }
});


// =========create bucket======
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


// ======delete bucket=======
exports.router.get('/deletebucket', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.DeleteBucketCommand({
        Bucket: payload.Bucket
    });

    try {
        const { response } = await client.send(command)
        // res.send(`${response} `)
    } catch (err) {
        res.send(err);
    }

});

//====== Buckettags======= 

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




//========= Buckettags ========= 

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

//======= Bucket Versions ========

exports.router.get('/bucketVersions', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket

    }
    try {
        const command = new s3Conn.ListObjectVersionsCommand(input);
        const response = await client.send(command);
        res.send(response);
    } catch (err) {
        res.send(err);
    }


});

// ======Bucket Headers =====

exports.router.post('/bucketHeaders', async (req, res) => {
    const payload = req.body;
    const headers = await requestId(payload.Bucket);
    const region = await Region(payload.Bucket);
    // const contenttype = await ContentType(payload.Bucket);
    const accesspoint = await AccessPoint(payload.AccountId, payload.Name)
    res.send({ headers, region,  accesspoint })


});


// ====requestId ======


function requestId(bucketName) {
    return new Promise(async (resolve, reject) => {
        const input = { "Bucket": bucketName }
        try {
            const command = new s3Conn.HeadBucketCommand(input);
            const response = await client.send(command);
            var date_time =new Date();
            var date = date_time.toGMTString()
            const obj = {
                'httpStatusCode': response.$metadata.httpStatusCode,
                'x-amz-id-2': response.$metadata.extendedRequestId,
                // extendedRequestId (or) id 2:76 (letters+numbers),requestId : 17(letters+numbers)
                'x-amz-request-id': response.$metadata.requestId,
                'Date':date
                

            }
            resolve(obj);
            // resolve(response);
        } catch (err) {
            resolve(err);
        }
    })
};

// =========region=====

function Region(bucketName) {
    return new Promise(async (resolve, reject) => {
        const input = { "Bucket": bucketName }
        try {
            const command = new s3Conn.GetBucketLocationCommand(input);
            const response = await client.send(command);
            const region = response.LocationConstraint || 'us-east-1';
            if (response.LocationConstraint !== null) {
                const serverName = `AmazonS3`;
                // const serverName = `AmazonS3`;
                const obj = {
                    'x-amz-bucket-region': region,
                    'Server': serverName
                }

                resolve(obj);
            }

        } catch (err) {
            resolve(err);
        }
    })

};



// ====AccessPointAlias=====

function AccessPoint(accountId, accessPointName) {
    return new Promise(async (resolve, reject) => {
        const input = {
            "AccountId": accountId,
            "Name": accessPointName
        }
        try {
            const command = new s3control.GetAccessPointCommand(input);
            const response = await control.send(command);
            const accessPointAlias = response.AccessPointArn.PublicAccessBlockConfiguration
                ? response.AccessPointArn.PublicAccessBlockConfiguration.BlockPublicAcls
                : false;
            const obj = {
                'x-amz-access-point-alias': accessPointAlias
            }

            resolve(obj)


        } catch (err) {
            resolve(err);
        }

    })

}

//  =========bucketPolicyStatus===//know the bucket public access or private access===








