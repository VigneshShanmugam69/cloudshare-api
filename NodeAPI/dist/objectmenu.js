const express = require("express");
exports.router = (0, express.Router)();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
});

// Copy folder and Object from source bucket to the destination bucket


exports.router.post('/copyobject', async (req, res) => {
    const payload = req.body;
    const sourceBucket = payload.sourceBucket;
    const sourceKeyName = payload.sourceKeyName;
    // source folder or source object
    const destinationBucket = payload.destinationBucket;
    const destinationKeyName = payload.destinationKeyName;
    const listObject = await list(sourceBucket, sourceKeyName, destinationBucket, destinationKeyName);

    try {
        res.send(listObject);
    } catch (err) {
        var error = {
            Error: err.code
        }
        res.send({ Result: error });
    }
})
function list(sourceBucket, sourceKeyName, destinationBucket, destinationKeyName) {
    return new Promise(async (resolve, reject) => {
        const listObjectParams = {
            Bucket: sourceBucket,
            Prefix: sourceKeyName
        }
        s3.listObjectsV2(listObjectParams, async (err, data) => {
            if (err) {
                var error = {
                    Error: err.code
                };
                resolve({ Result1: error });
            }
            else {
                (data.Contents.forEach(async (object) => {
                    function sourcePath() {
                        return new Promise(async (resolve, reject) => {
                            const params = {
                                Bucket: destinationBucket,
                                Prefix: destinationKeyName
                            }

                            s3.listObjectsV2(params, function (err, value) {
                                if (err) {
                                    resolve.err
                                } else {
                                    if (params.Prefix) {
                                        resolve(`${destinationKeyName}/${object.Key}${object.Key.replace(sourceKeyName, '')}`);
                                    }
                                    else {
                                        resolve(`${sourceKeyName}${object.Key.replace(sourceKeyName, '')}`)
                                    }

                                }
                            })
                        })
                    }
                    const path = await sourcePath()

                    const copyObjectParams = {
                        Bucket: destinationBucket,
                        CopySource: `${sourceBucket}/${object.Key}`,
                        Key: `${path}`

                    };
                    s3.copyObject(copyObjectParams, (err, data) => {
                        if (err) {
                            var error = {
                                Error: err.code
                            };
                            resolve({ Result: error });

                        } else {
                            var obj = {
                                CopySourceVersionId: data.CopySourceVersionId,
                                VersionId: data.VersionId,
                                ServerSideEncryption: data.ServerSideEncryption,
                                ETag: data.CopyObjectResult.ETag,
                                LastModified: data.CopyObjectResult.LastModified.toUTCString()
                            };

                            resolve({ Result: obj });
                        }
                    })
                }))
            }
        })
    })
}


// Move folder and the object from source bucket to destination bucket

exports.router.post('/moveObject', async (req, res) => {
    try {
        const payload = req.body
        const copyObject = await copy(payload.sourceBucket, payload.sourceKeyName, payload.destinationBucket, payload.destinationKeyName)
        const deleteObject = await deleteObjects(payload.sourceBucket, payload.sourceKeyName)
        res.send({ Result: copyObject });

    } catch (err) {
        let obj = {
            Error: err.Code
        }
        res.send({ Result: obj })
    }

})
function copy(sourceBucket, sourceKeyName, destinationBucket, destinationKeyName) {
    return new Promise(async (resolve, reject) => {
        const listObjectParams = {
            Bucket: sourceBucket,
            Prefix: sourceKeyName
        }
        function list() {
            return new Promise(async (resolve, reject) => {
                s3.listObjectsV2(listObjectParams, async (err, data) => {
                    if (err) {
                        var error = {
                            Error: err.code
                        }
                        resolve(error);
                    }
                    else {
                        (data.Contents.forEach(async (object) => {
                            function sourcePath() {
                                return new Promise(async (resolve, reject) => {

                                    const params = {
                                        Bucket: destinationBucket,
                                        Prefix: destinationKeyName
                                    }

                                    s3.listObjectsV2(params, function (err, value) {
                                        if (err) {
                                            resolve.err
                                        } else {
                                            if (params.Prefix) {
                                                resolve(`${destinationKeyName}/${object.Key}${object.Key.replace(sourceKeyName, '')}`);
                                            }
                                            else {
                                                resolve(`${sourceKeyName}${object.Key.replace(sourceKeyName, '')}`)
                                            }

                                        }
                                    })
                                })
                            }
                            const path = await sourcePath()
                            const copyObjectParams = {
                                Bucket: destinationBucket,
                                CopySource: `${sourceBucket}/${object.Key}`,
                                Key: `${path}`
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
                            })
                        }))
                    }
                })
            })
        }
        const listObject = await list();
        resolve(listObject);
    })
}

function deleteObjects(sourceBucket, sourceKeyName) {
    return new Promise(async (resolve, reject) => {
        const listObjectParams = {
            Bucket: sourceBucket,
            Prefix: sourceKeyName
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
                            }
                            resolve(error);
                        } else {
                            resolve("Object deleted");
                        }
                    })
                }))
            }
        })
    })
}


