//import express from "express";

const express = require("express");
const dbconnection = require("./dbconnection");
exports.router = (0, express.Router)();
const s3Conn = require("@aws-sdk/client-s3");
const { createScanner } = require("typescript");
const s3control = require("@aws-sdk/client-s3-control")

//import { ListBucketsCommand,DeleteBucketCommand,CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
});
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
            Result: response.TagSet
        }
        res.send(obj);

    } catch (err) {
        let obj = {
            Error: err.Code
        }
        res.send({ Result: [obj] });

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
        if (headers?.$metadata?.httpStatusCode > 300) {
            let obj = {
                Error: "The Bucket not found"

            }
            res.send({ Result: [obj] })


        }
        const region = await regionName(payload.Bucket);
        const accesspoint = await accessPoint(payload.AccountId, payload.Name);
        const result = [headers, region, accesspoint]
        let list = {};
        for (var i = 0; i < result.length; i++) {
            for (const [key, value] of Object.entries(result[i])) {
                list[key] = value
            }
        }
        res.send({ Result: list });
    } catch (err) {
        let obj = {
            Error: err.Code
        }
        res.send({ Result: [obj] });
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

function regionName(bucketName) {
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

function accessPoint(accountId, accessPointName) {
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

// Bucket Permissions  

exports.router.post('/bucketPermissions', async (req, res) => {
    try {
        let payload = req.body;
        const policyStatus = await bucketPolicyStatus(payload.Bucket);
        const ownerShip = await objectOwnerShip(payload.Bucket);
        const accessControl = await accessControlList(payload.Bucket);
        const cors = await crossOrigin(payload.Bucket);
        const result = [policyStatus, ownerShip, accessControl, cors];
        let list = {};
        for (var i = 0; i < result.length; i++) {
            for (const [key, value] of Object.entries(result[i])) {
                list[key] = value
            }
        }
        res.send({ Result: list });
        // res.send({ Result: result });

    } catch (err) {
        res.send({ Result: err });

    }
})

function accessControlList(bucket) {
    return new Promise(async (resolve, reject) => {
        const input = {
            "Bucket": bucket
        }
        try {
            const command = new s3Conn.GetBucketAclCommand(input);
            const response = await client.send(command);
            var length = response.Grants.length;

            if (length == 1) {
                let obj = {
                    "Owner": response.Grants[0].Grantee.DisplayName,
                    "CanonicalID": response.Grants[0].Grantee.ID,
                    "OwnerPermission": response.Grants[0].Permission,
                    // "OwnerType": response.Grants[0].Grantee.Type

                }
                resolve(obj)
            }
            else if (length == 2) {
                let obj = {
                    "Owner": response.Grants[0].Grantee.DisplayName,
                    "CanonicalID": response.Grants[0].Grantee.ID,
                    "OwnerPermission": response.Grants[0].Permission,
                    // "OwnerType": response.Grants[0].Grantee.Type,
                    // "UserType": response.Grants[0].Grantee.Type,
                    "UserPermission": response.Grants[1].Permission
                }
                resolve(obj)
            }
            else {
                let obj = {
                    "Owner": response.Grants[0].Grantee.DisplayName,
                    "CanonicalID": response.Grants[0].Grantee.ID,
                    "OwnerPermission": response.Grants[0].Permission,
                    // "OwnerType": response.Grants[0].Grantee.Type,
                    // "UserType": response.Grants[0].Grantee.Type,
                    "UserPermissions": response.Grants[1].Permission + "," + response.Grants[2].Permission
                }
                resolve(obj)
            }
        } catch (err) {
            resolve({ AccessControlList: err.Code });
        }
    })
}

// bucketPolicyStatus to know the bucket is public access or private access

function bucketPolicyStatus(bucket) {
    return new Promise(async (resolve, reject) => {
        const input = {
            "Bucket": bucket
        }
        try {
            const command = new s3Conn.GetBucketPolicyStatusCommand(input);
            const response = await client.send(command);
            // const policyStatus = response.PolicyStatus.IsPublic ?response.PolicyStatus.IsPublic.BlockPublicAcls:false;
            let status = response.PolicyStatus.IsPublic;
            if (status == true) {
                resolve({ Access: "Public" })
            }

        } catch (err) {
            let obj = {
                Access: err.message && `Bucket and objects not public`
            }
            resolve(obj);
        }
    })
}


// object ownership (To find the owner of the object in the bucket)

function objectOwnerShip(bucket) {
    return new Promise(async (resolve, reject) => {
        const input = {
            "Bucket": bucket
        }
        try {
            const command = new s3Conn.GetBucketOwnershipControlsCommand(input);
            const response = await client.send(command);
            const obj = response.OwnershipControls.Rules[0];
            resolve(obj)
        } catch (err) {
            let obj = {
                ObjectOwnership: err.message
            }
            resolve(obj);
        }
    })

}

//cross origin

function crossOrigin(bucket) {
    return new Promise(async (response, reject) => {
        const input = {
            Bucket: bucket
        }
        const command = new s3Conn.GetBucketCorsCommand(input);
        try {
            const response = await client.send(command);
            // response.CORSRules
            let cors = {
                CORS: response.CORSRules
            }
            response(cors);
        } catch (err) {
            let obj = {
                CORS: err.message && `No configurations to display`
            }
            response(obj);
        }

    });
}


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
            const LastModified = deletemarkers[j].LastModified.toUTCString();
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
        res.send({ Result: result });

    } catch (err) {
        var error = {
            Error: err.Code
        }
        res.send({ Result: error });
    }


});

// Copy Object from source bucket to the destination bucket

exports.router.post('/copyobject', async (req, res) => {
    const payload = req.body;

    const listObjectParams = {
        Bucket: payload.sourceBucket,
        Prefix: payload.folderName
    }
    try {
        s3.listObjectsV2(listObjectParams, async (err, data) => {
            if (err) {
                var error = {
                    Error: err.code
                };
                res.send({ Result: error });
            }
            else {
                (data.Contents.forEach(async (object) => {
                    const copyObjectParams = {
                        Bucket: payload.destinationBucket,
                        CopySource: `${payload.sourceBucket}/${object.Key}`,
                        Key: `${payload.folderName}${object.Key.replace(payload.folderName, '')}`
                    };
                    await s3.copyObject(copyObjectParams, (err, data) => {
                        if (err) {

                            var error = {
                                Error: err.code
                            };
                            res.send({ Result: error });

                        } else {
                            var obj = {
                                CopySourceVersionId: data.CopySourceVersionId,
                                VersionId: data.VersionId,
                                ServerSideEncryption: data.ServerSideEncryption,
                                ETag: data.CopyObjectResult.ETag,
                                LastModified: data.CopyObjectResult.LastModified.toUTCString()
                            };
                            res.send({ Result: obj });
                        }
                    }).promise();
                }));
            }
        })
    } catch (err) {
        var error = {
            Error: err.code
        }
        res.send({ Result: error });

    }

})




















