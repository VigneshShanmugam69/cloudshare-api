const express = require("express");
exports.router = (0, express.Router)();
const AWS = require('aws-sdk');
var async = require('async');

const s3 = new AWS.S3({
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
});

// Copy folder and Object from source bucket to the destination bucket


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
                    s3.copyObject(copyObjectParams, (err, data) => {
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
                    })
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

// Move folder and the object from source bucket to destination bucket



exports.router.post('/moveObject', async (req, res) => {
    try {
        const payload = req.body
        const copyObject = await copy(payload.sourceBucket, payload.folderName, payload.destinationBucket)
        const deleteObject = await deleteObjects(payload.sourceBucket, payload.folderName)
        res.send({ Result: copyObject });

    } catch (err) {
        // let obj = {
        //     Error: err.Code
        // }
        res.send({ Result: err });
    }

})
function copy(sourceBucket, folderName, destinationBucket) {
    return new Promise(async (resolve, reject) => {
        const listObjectParams = {
            Bucket: sourceBucket,
            Prefix: folderName
        }
        s3.listObjectsV2(listObjectParams, async (err, data) => {
            if (err) {
                var error = {
                    Error: err.code
                };
                resolve(err);

            }
            else {

                (data.Contents.forEach(async (object) => {
                    const copyObjectParams = {
                        Bucket: destinationBucket,
                        CopySource: `${sourceBucket}/${object.Key}`,
                        Key: `${folderName}${object.Key.replace(folderName, '')}`
                        // 1st folderName=destinationFolder, 2nd foldrName = source folder
                    };
                    s3.copyObject(copyObjectParams, (err, data) => {
                        if (err) {

                            var error = {
                                Error: err.code
                            };
                            resolve(error);

                        } else {
                            var obj = {
                                CopySourceVersionId: data.CopySourceVersionId,
                                VersionId: data.VersionId,
                                ServerSideEncryption: data.ServerSideEncryption,
                                ETag: data.CopyObjectResult.ETag,
                                LastModified: data.CopyObjectResult.LastModified.toUTCString()
                            };


                            resolve(obj);
                        }
                    });
                }));
            }


        })
    })
}

function deleteObjects(sourceBucket, folderName) {
    return new Promise(async (resolve, reject) => {
        const listObjectParams = {
            Bucket: sourceBucket,
            Prefix: folderName
        }
        s3.listObjectsV2(listObjectParams, async (err, data) => {
            if (err) {
                var error = {
                    Error: err.code
                };
                resolve(error);
            }
            else {

                (data.Contents.forEach(async (object) => {
                    const deleteObjectParams = {
                        Bucket: sourceBucket,
                        Key: object.Key
                    };
                    s3.deleteObject(deleteObjectParams, (err, data) => {
                        if (err) {

                            var error = {
                                Error: err.code
                            };
                            resolve(error);

                        } else {

                            resolve("Object deleted");
                        }
                    });
                }));
            }


        })
    })
}


