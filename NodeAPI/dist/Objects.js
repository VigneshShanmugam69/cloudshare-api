const express_1 = require("express");
const dbconnection_1 = require("./dbconnection");
exports.router = (0, express_1.Router)();
const s3Conn = require("@aws-sdk/client-s3")

const client = new s3Conn.S3Client({
    apiVersion: '0.1', region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIA6HCJB5CURVIR3QW7',
        secretAccessKey: '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'
    }
});

exports.router.get('/getobjects', async (req, res) => {
    const command = new s3Conn.ListObjectsV2Command({
        Bucket: "cloudstier-gkumar-demo-001",
        // MaxKeys: 2,
    });
    try 
    {
        const { Contents } = await client.send(command);
        console.log(Contents);
        res.send(Contents);
    }
    catch (err) 
    {
        console.error(err);
    }
});



