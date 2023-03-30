//import express from "express";

const express = require("express");
const dbconnection = require("./dbconnection");
exports.router = (0, express.Router)();
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

// listbuckets
exports.router.get('/listbuckets', async (req, res) => {
    const command = new s3Conn.ListBucketsCommand({});

    try {
        const { Owner, Buckets } = await client.send(command);
        res.send(Buckets)
    } catch (err) {
        res.send(err);
    }
});


// create bucket
exports.router.post('/createbucket', async (req, res) => {
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


// delete bucket
exports.router.post('/deletebucket', async (req, res) => {
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

// Buckettags 

exports.router.post('/buckettags', async (req, res) => {
    // async function name(){
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket
    }
    const command = new s3Conn.GetBucketTaggingCommand(input);
    try {
        const response = await client.send(command);
        let obj = {
            TagSet: response.TagSet
        }
        res.send(obj);

    } catch (err) {
        let obj = {
            TagSet: err.Code
        }
        res.send({ Result: [obj] });

    }

});


// Bucket Permissions  

exports.router.post('/bucketPermissions', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket

    }
    try {
        const command = new s3Conn.GetBucketAclCommand(input);
        const response = await client.send(command);
        // let obj = {
        //     "Owner": response.Grants[0].Grantee.DisplayName,
        //     "ID": response.Grants[0].Grantee.ID,
        //     "OwnerPermission": response.Grants[0].Permission,
        //     "OwnerType": response.Grants[0].Grantee.Type,
        //     "UserType": response.Grants[1].Grantee.Type,
        // "UserPermissions": response.Grants[1].Permission + "," + response.Grants[2].Permission
        // };
        // res.send({ Result: obj });
        let result = {
            Grants: response.Grants
        }
        res.send(result);
    } catch (err) {
        let obj = {
            Error: err.Code
        }
        res.send(obj);
    }


});

// Bucket Versions 

exports.router.post('/bucketVersions', async (req, res) => {
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


// Bucket Headers 

exports.router.post('/bucketHeaders', async (req, res) => {
    try {
        const payload = req.body;
        const headers = await requestId(payload.Bucket);
        const region = await Region(payload.Bucket);
        // const contenttype = await ContentType(payload.Bucket);
        const accesspoint = await AccessPoint(payload.AccountId, payload.Name)
        res.send({ Result: [headers, region, accesspoint] })
    }catch(err){
        res.send(err);
    }

});


// requestId 


function requestId(bucketName) {
    return new Promise(async (resolve, reject) => {
        const input = { "Bucket": bucketName }
        try {
            const command = new s3Conn.HeadBucketCommand(input);
            const response = await client.send(command);
            var date_time = new Date();
            var date = date_time.toUTCString()
            // toGMTString,toISOString
            const obj = {
                'x-amz-id-2': response.$metadata.extendedRequestId,
                // extendedRequestId (or) id 2:76 (letters+numbers),requestId : 17(letters+numbers)
                'x-amz-request-id': response.$metadata.requestId,
                'Date': date
            }
            resolve(obj);
            // resolve(response);
        } catch (err) {
            resolve(err);
        }
    })
};

// region

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



// AccessPointAlias

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

// bucketPolicyStatus to know the bucket is public access or private access

exports.router.post('/bucketPolicyStatus', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket

    }
    try {
        const command = new s3Conn.GetBucketPolicyStatusCommand(input);
        const response = await client.send(command);
        // const policyStatus = response.PolicyStatus.IsPublic ?response.PolicyStatus.IsPublic.BlockPublicAcls:false;
        let status = {
            PolicyStatus: response.PolicyStatus
        }
        res.send(status);
    } catch (err) {
        let obj = {
            Code: err.Code
        }
        res.send({ Result: obj });
    }
})

// object ownership (To find the owner of the object in the bucket)


exports.router.post('/objectownership', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket

    }
    try {
        const command = new s3Conn.GetBucketOwnershipControlsCommand(input);
        const response = await client.send(command);
        const obj = {
            ObjectOwnership: response.OwnershipControls.Rules
        }
        res.send(obj)
    } catch (err) {
        let obj = {
            ObjectOwnerShip: err.Code
        }
        res.send({ Result: [obj] });
    }
})

//cross origin
exports.router.post('/crossOrigin', async (req, res) => {
    const payload = req.body;
    const input = {
        Bucket: payload.Bucket
    }

    const command = new s3Conn.GetBucketCorsCommand(input);
    try {
        const response = await client.send(command);
        // response.CORSRules
        let cors = {
            CORSRules: response.CORSRules
        }
        res.send(cors);
    } catch (err) {
        let obj ={
          Code:err.Code  
        }
        res.send({Result:[obj]});
    }

});


// object Versions

exports.router.post('/objectVersions', async (req, res) => {
    const payload = req.body;
    const input = {
        "Bucket": payload.Bucket,
        "Prefix": payload.Key

    }
    try {
        const command = new s3Conn.ListObjectVersionsCommand(input);
        const response = await client.send(command);

        const versions = response.Versions;
        const versionsCount = versions.length;


        const deletemarkers = response.DeleteMarkers;
        const deletemarkersCount = deletemarkers.length;

        // const date =new Date();
        // const Date = date.getUTCSeconds()
        function formatSizeUnits(bytes) {
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let index = 0;
            while (bytes >= 1024) {
                bytes /= 1024;
                index++;
            }
            return `${parseFloat(bytes.toFixed(2))} ${units[index]}`;
        }


        const versionsList = [];
        let i = 0;
        while (i < versionsCount) {
            const Size = formatSizeUnits(versions[i].Size);
            const LastModified = versions[i].LastModified.toUTCString();
            const ETag = versions[i].ETag;
            const StorageClass = versions[i].StorageClass;
            const Name = versions[i].Owner.DisplayName;
            const Id = versions[i].Owner.ID;
            const Owner = (`${Name}(${Id})`);
            const Versionid = versions[i].VersionId;
            const IsLatest = versions[i].IsLatest
            versionsList.push({
                LastModified,
                ETag,
                Size,
                StorageClass,
                Owner,
                Versionid,
                IsLatest
            });
            i++;
        }

        const deletemarkersList = [];
        let j = 0;
        while (j < deletemarkersCount) {
            const LastModified = deletemarkers[j].LastModified;
            const Name = deletemarkers[j].Owner.DisplayName;
            const Id = deletemarkers[j].Owner.ID;
            const Owner = `${Name}(${Id})`;
            deletemarkersList.push({
                LastModified,
                Owner
            });
            j++;
        }
        let result = {
            Key: response.Versions[0].Key,
            Versions: versionsList,
            DeleteMarkers: deletemarkersList

        }
        res.send(result);

    } catch (err) {
        res.send(err.Code);
    }


});




