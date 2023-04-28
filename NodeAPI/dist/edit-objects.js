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

