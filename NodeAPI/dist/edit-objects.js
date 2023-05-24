const express_1 = require("express");
exports.router = (0, express_1.Router)();
const connect = require('./dbconnection');
const AWS = require('aws-sdk');
const kms = new AWS.KMS({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
  }
});
const s3 = new AWS.S3({
  accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
  secretAccessKey: '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'
});

// Renaming object
exports.router.post('/renameObject', function (req, res) {
  const { bucketName,
    folderPath,
    oldObjectName,
    newObjectName
  } = req.body;
  const oldObjectKey = folderPath ? `${folderPath}${oldObjectName}` : oldObjectName;
  const newObjectKey = folderPath ? `${folderPath}${newObjectName}` : newObjectName;
  const params = {
    Bucket: bucketName,
    Prefix: folderPath ? `${folderPath}` : ''
  };
  s3.listObjectsV2(params, function (err, data) {
    if (err) {
      if (err.message.includes("The specified bucket does not exist")) {
        res.status(404).send({ Result: `Bucket ${bucketName} does not exist` });
      } else if (err.message.includes("The specified key does not exist")) {
        res.status(404).send({ Result: `Folder ${folderPath} does not exists` });
      } else {
        res.status(500).send('Error renaming object');
      }
    } else {
      const objects = data.Contents.map(obj => obj.Key);
      if (!objects.includes(oldObjectKey)) {
        res.status(404).send({ Result: "Object not found" });
      } else {
        const copyParams = {
          Bucket: bucketName,
          CopySource: `/${bucketName}/${oldObjectKey}`,
          Key: newObjectKey
        };
        s3.copyObject(copyParams, function (err, data) {
          if (err) {
            res.status(500).send({ Result: 'Error renaming object' });
          } else {
            s3.deleteObject({ Bucket: bucketName, Key: oldObjectKey }, function (err, data) {
              if (err) {
                res.status(500).send({ Result: 'Error renaming object' });
              } else {
                res.send({ Result: `Object renamed from ${oldObjectKey} to ${newObjectKey}` });
              }
            });
          }
        });
      }
    }
  });
});

// Edit the storage class for all the objects within the folder
exports.router.post('/editStorageClassForFolder', function (req, res) {
  const { bucketName,
    folderPath,
    storageClass
  } = req.body;
  s3.headBucket({ Bucket: bucketName }, function (err, data) {
    if (err) {
      if (err.code === 'NotFound') {
        res.status(404).send({ Result: `Bucket ${bucketName} does not exist` })
      } else {
        res.status(500).send({ Result: `Error checking bucket ${bucketName}: ${err}` });
      }
      return;
    };
    if (folderPath) {
      const headParams = {
        Bucket: bucketName,
        Key: folderPath
      };
      s3.headObject(headParams, function (err, data) {
        if (err) {
          if (err.code === 'ReferenceError') {
            res.send({ Result: 'The bucket or object does not exist' });
          } else if (err.code === 'NotFound') {
            res.status(404).send({ Result: `Folder ${folderPath} not found in bucket ${bucketName}` })
          } else {
            res.send(err);
          }
        } else {
          const listParams = {
            Bucket: bucketName,
            Prefix: folderPath
          };
          s3.listObjectsV2(listParams, (err, data) => {
            if (err) {
              if (err.message.includes("The storage class you specified is not valid")) {
                res.status(400).send({ Result: `Invalid storage class` })
              } else {
                res.status(500).send({ Result: `Error listing objects in ${bucketName}/${folderPath}: ${err}` });
              }
              return;
            }
            else {
              const objects = data.Contents;
              const totalCount = objects.length;
              let updatedCount = 0;
              let errorSent = false; // Flag to check if error message has been sent
              objects.forEach((obj) => {
                const params = {
                  Bucket: bucketName,
                  CopySource: `${bucketName}/${obj.Key}`,
                  Key: obj.Key,
                  StorageClass: storageClass
                };
                s3.copyObject(params, function (err, data) {
                  if (err) {
                    if (err.code === 'InvalidStorageClass' && !errorSent) {
                      res.status(400).send({ Result: `Invalid storage class: ${storageClass}` });
                      errorSent = true;
                    } else if (!errorSent) {
                      res.status(500).send({ Result: `Error updating object ${bucketName}/${obj.Key}: ${err}` });
                      errorSent = true;
                    }
                  } else {
                    updatedCount++;
                  }
                  // Check if all objects have been updated
                  if (updatedCount === totalCount && !errorSent) {
                    res.status(200).send({ Result: `Updated storage class for objects in ${bucketName}/${folderPath} to ${storageClass}` });
                  }
                });
              });
            }
          });
        }
      });
    }
    else {
      res.send({ Result: 'Folder path is not set. Storage class cannot be changed.' });
    }
  })
});

// To change storage class
exports.router.post('/editStorageClass', function (req, res) {
  const payload = req.body;
  const bucketName = payload.bucketName;
  const folderPath = payload.folderPath;
  const objectKey = folderPath + payload.key;
  const storageClass = payload.storageClass
  const objectParams = {
    Bucket: bucketName,
    CopySource: `${bucketName}/${objectKey}`,
    Key: objectKey,
    StorageClass: storageClass
  };
  s3.copyObject(objectParams, function (err, data) {
    if (err) {
      if (err.message.includes("The specified bucket does not exist")) {
        res.status(404).send({ Result: `Bucket ${bucketName} does not exist` });
      } else if (err.message.includes("The specified key does not exist")) {
        res.status(404).send({ Result: `${objectKey} does not exists` })
      } else if (err.message.includes("The specified key does not exist")) {
        res.status(404).send({ Result: `Folder ${folderPath} does not exists` });
      } else if (err.message.includes("The storage class you specified is not valid")) {
        res.status(400).send({ Result: `Invalid storage class` })
      } else {
        res.status(500).send({ Result: 'Error renaming object', err });
      }
    } else {
      res.send({ Result: `Successfully changed storage class for ${objectKey}` });
    }
  });
});

// Get available storage classes
exports.router.get('/getAvailableStorage', async (req, res) => {
  var sql = "SELECT * FROM storageclasses WHERE Status = 1";
  const connection = await (connect.connect)();
  const storageClasses = await connection.query(sql);
  let obj = {
    "status": 1,
    "message": "Storage classes found",
    "result": storageClasses[0]
  }
  res.send(obj);
});

// Get meta data types
exports.router.get('/getMetaDatatypes', async (req, res) => {
  var sql = "SELECT * FROM MetadataTypes WHERE Status = 1;";
  const connection = await (connect.connect)();
  const types = await connection.query(sql);
  let obj = {
    "status": 1,
    "message": "Metadata types found",
    "result": types[0]
  }
  res.send(obj);
});

// Get system defined Keys
exports.router.get('/getSystemDefinedKeys', async (req, res) => {
  const payload = req.body;
  const MetadataTypeID = payload.metadataTypeID;
  if (MetadataTypeID === 1) {
    var sql = "SELECT * FROM MetadataKeys WHERE MetadataTypeID = 1 AND Status = 1;"
    const connection = await (connect.connect)();
    const MetadataKeys = await connection.query(sql);
    let obj = {
      "status": 1,
      "message": "System defined keys found",
      "result": MetadataKeys[0]
    }
    res.send(obj);
  }
  else {
    let obj = {
      "status": 2,
      "message": "Invalid metadata type id"
    }
    res.send(obj);
  }
});

// Get content-type values
exports.router.get('/getContentTypeValues', async (req, res) => {
  const payload = req.body;
  const metadata = payload.metadataTypeID;
  const systemDefined = payload.systemDefinedKeyID;
  if (metadata === 1) {
    if (systemDefined === 1) {
      var sql = "SELECT ctp.ID, mt.Type, mk.SystemDefinedKey, ctp.Value \
      FROM ContentTypeValues ctp  \
      INNER JOIN MetadataTypes mt ON mt.ID = ctp.MetadataTypeID \
      INNER JOIN MetadataKeys mk ON mk.ID = ctp.SystemDefinedKeyID"
      const connection = await (connect.connect)();
      const MetadataKeys = await connection.query(sql);
      let obj = {
        "status": 1,
        "message": "System defined keys found",
        "result": MetadataKeys[0]
      }
      res.send(obj);
    } else {
      let obj = {
        "status": 2,
        "message": "Invalid system defined key id"
      }
      res.send(obj);
    }
  }
  else {
    let obj = {
      "status": 0,
      "message": "Invalid metadata Type id"
    }
    res.send(obj);
  }
});


// Edit object metadata 
exports.router.post('/addUserDefinedMetadata', function (req, res) {
  const payload = req.body;
  const bucketName = payload.bucketName;
  const folderPath = payload.folderPath;
  const objectKey = folderPath + payload.objectKey;
  const key = payload.userDefinedKey;
  const userValue = payload.userDefinedValue;

  const getObjectMetadataParams = {
    Bucket: bucketName,
    Key: objectKey
  };
  // To list existing user defined metadata 
  s3.headObject(getObjectMetadataParams, function (err, data) {
    if (err) {
      if (err.code === 'NotFound') {
        res.status(404).send({ Result: `Bucket ${bucketName} or ${objectKey} does not exist` });
      } else {
        res.status(500).send({ Result: 'Head object', err });
      }
    } else {
      if (key != '') {
        if (userValue != '') {
          const existingMetadata = data.Metadata || {};
          // Adding new user defined meta data
          const newMetadata = {
            [key]: userValue
          };
          // Listing existing metada and add the new metadata
          const mergedMetadata = { ...existingMetadata, ...newMetadata };

          const copyObjectParams = {
            Bucket: bucketName,
            CopySource: `${bucketName}/${objectKey}`,
            Key: objectKey,
            MetadataDirective: 'REPLACE',
            Metadata: mergedMetadata // The Metadata stands for UserDefined
          };

          s3.copyObject(copyObjectParams, function (err, data) {
            if (err) {
              if (err.code === 'SignatureDoesNotMatch') {
                res.status(400).send({ Result: 'You can add each metadata key only once.' })
              } else {
                res.status(500).send({ Result: 'Error adding metadata', err });
              }
            } else {
              res.send({ Result: 'Metadata added successfully' });
            }
          });
        } else {
          res.status(400).send({ Result: 'A metadata value is required.' })
        }
      } else {
        res.status(400).send({ Result: 'A metadata key is required.' })
      }
    }
  });
});

// Add and update the object tag.
exports.router.post('/ObjectTag', function (req, res) {
  const payload = req.body;
  const bucketName = payload.bucketName;
  const objectKey = payload.objectKey;
  const indexToUpdate = payload.indexToUpdate;
  const newKey = payload.newKey;
  const newValue = payload.newValue;

  // Retrieve the existing object tags
  const getObjectTaggingParams = {
    Bucket: bucketName,
    Key: objectKey
  };
  
  s3.getObjectTagging(getObjectTaggingParams, function (err, data) {
    if (err) {
      if (err.code === 'NoSuchKey') {
        res.status(404).send({ Result: `The object ${objectKey} does not exist` });
      }
      else if (err.code === 'NoSuchBucket') {
        res.status(404).send({ Result: `The bucket ${bucketName} does not exist` });
      }
      else {
        res.send({ Result: 'Error listing object tag', err });
      }
    } else {
      if (newKey != '') {
        if (newValue != '') {
          // Listing the existing tags
          const existingTagSet = data.TagSet;
          // Check if the index is within the range of the existing TagSet 
          // if exists update the tag set
          if (indexToUpdate >= 0 && indexToUpdate < existingTagSet.length) {
            // Update the key and value at the specified index
            existingTagSet[indexToUpdate].Key = newKey;
            existingTagSet[indexToUpdate].Value = newValue;
            // Update the object's tags with the modified TagSet
            const putObjectTaggingParams = {
              Bucket: bucketName,
              Key: objectKey,
              Tagging: {
                TagSet: existingTagSet
              }
            };
            s3.putObjectTagging(putObjectTaggingParams, function (err, data) {
              if (err) {
                if (err.message.includes("Cannot provide multiple Tags with the same key")) {
                  res.status(404).send({ Result: "Keys must be unique." });
                } else if (err.message.includes("Object tags cannot be greater than 10")) {
                  res.status(400).send({ Result: "Object tags cannot be greater than 10" })
                } else if (err.message.includes("The TagKey you have provided is invalid")) {
                  res.status(400).send({ Result: "A tag key is required." })
                } else {
                  res.status(500).send({ Result: 'Error renaming object', err });
                }
              } else {
                res.send({ Result: 'Successfully edited tags.' });
              }
            });
            // Add new object tag
          } else {
            // Listing the existing tags. 
            const existingTagSet = data.TagSet;
            // Adding the new tag.     
            const newTag = { Key: payload.newKey, Value: payload.newValue };
            // Append the new tag to the existing TagSet  
            const newTagSet = [...existingTagSet, newTag];
            // Update the object's tags with the new TagSet
            const putObjectTaggingParams = {
              Bucket: bucketName,
              Key: objectKey,
              Tagging: {
                TagSet: newTagSet
              }
            };
            s3.putObjectTagging(putObjectTaggingParams, function (err, data) {
              if (err) {
                if (err.message.includes("Cannot provide multiple Tags with the same key")) {
                  res.status(404).send({ Result: "Keys must be unique." });
                } else if (err.message.includes("Object tags cannot be greater than 10")) {
                  res.status(400).send({ Result: "Object tags cannot be greater than 10" })
                } else if (err.message.includes("The TagKey you have provided is invalid")) {
                  res.status(400).send({ Result: "A tag key is required." })
                } else {
                  res.status(500).send({ Result: 'Error renaming object', err });
                }
              } else {
                res.send({ Result: 'Successfully edited tags.' });
              }
            });
          }
        } else {
          res.send({ Result: "A tag Value is required." });
        }
      } else {
        res.send({ Result: "A tag key is required." });
      }
    }
  });
});

  