  const express_1 = require("express");
  const dbconnection_1 = require("./dbconnection");
  exports.router = (0, express_1.Router)();
  const s3Conn = require("@aws-sdk/client-s3")
  const AWS = require('aws-sdk');

  const s3 = new AWS.S3({
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
  });

  const client = new s3Conn.S3Client({
    apiVersion: '0.1', region: 'us-east-1',
    credentials: {
      accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
      secretAccessKey: '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'
    }
  });

  //List all the objects and folders.
  exports.router.post('/getobjects', (req, res) => {
    const payload = req.body;
    return new Promise((resolve, reject) => {
      const s3params = {
        Bucket: payload.Bucket,
        MaxKeys: 1000,
        Delimiter: '/',
      };
      s3.listObjectsV2(s3params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
        res.send(data);
      });
    });
  });

  //To get objects with in a folder
  exports.router.post('/getfolderobjects', (req, res) => {
    const payload = req.body;   
    const params = {
      Bucket: payload.Bucket,
      Prefix: payload.folderPath,
    };
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        res.send(err, err.stack);
        res.status(500).send('Error retrieving objects');
      } else {
        const objects = data.Contents.map(content => content.Key.replace(payload.folderPath, ''));
        res.send({ Objects: objects });
      }
    });
  });

  //Meta data
  exports.router.get('/getmetadata', async (req, res) => {
    const input = {
      "Bucket": "cloudstier-plakshmanan-demo-001",
      "Key": "29909.jpg"
    };
    try {
      const command = new s3Conn.HeadObjectCommand(input);
      const response = await client.send(command);
      res.send(response);
    }
    catch (err) {
      console.error(err);
      res.send(err);
    }
  });

  //Delete single object
  exports.router.get('/deleteObject', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.DeleteObjectCommand({
      Bucket: payload.Bucket,
      Key: payload.Key,
      // Key: "elsainfall.0.jpg",
    });
    try {
      const response = await client.send(command);
      console.log(response);
      res.send('Object deleted')
    }
    catch (err) {
      console.error(err);
    }
  });

  //Delete multiple objects 
  exports.router.get('/deleteObjects', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.DeleteObjectsCommand({
      Bucket: payload.Bucket,
      Delete: {
        Objects: [{ Key: payload.Key1, }, { Key: payload.Key2, }],
      },
    });
    try {
      const { Deleted } = await client.send(command);
      res.send(
        `Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`
      );
      res.send(Deleted.map((d) => ` • ${d.Key}`).join("\n"));
      res.send('Objects deleted')
    } catch (err) {
      console.error(err);
    }
  });


