const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();
const s3Conn = require("@aws-sdk/client-s3")

const client = new s3Conn.S3Client({
  apiVersion: '0.1', region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
  }
});

//List Objects

exports.router.get('/getobjects', async (req, res) => {
  const payload = req.body;
  const command = new s3Conn.ListObjectsV2Command({
    Bucket: payload.Bucket,
    // Bucket: "cloudstier-gkumar-demo-001",
    // MaxKeys: 3,
  });
  try {
    const { Contents } = await client.send(command);
    console.log(Contents);
    res.send(Contents);
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
    console.log(
      `Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`
    );
    console.log(Deleted.map((d) => ` • ${d.Key}`).join("\n"));
    res.send('Objects deleted')
  } catch (err) {
    console.error(err);
  }
});