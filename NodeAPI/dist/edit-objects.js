const express_1 = require("express");
exports.router = (0, express_1.Router)();
const AWS = require('aws-sdk');

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