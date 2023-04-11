  const express_1 = require("express");
  const dbconnection_1 = require("./dbconnection");
  exports.router = (0, express_1.Router)();
  const AWS = require('aws-sdk');

  const s3 = new AWS.S3({
    accessKeyId: 'AKIA6HCJB5CUWQJCY3FQ',
    secretAccessKey: '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'
  });


  // Convert file size B into KB, MB, GB
  function formatSizeUnits(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let index = 0;
    while (bytes >= 1024) {
      bytes /= 1024;
      index++;
    }
    return `${parseFloat(bytes.toFixed(2))} ${units[index]}`;
  }   

  //List all the objects and folders with in a bucket.
  exports.router.post('/getobjects', (req, res) => {
    const payload = req.body;
    const s3params = {
      Bucket: payload.Bucket,              
      // MaxKeys: 1000,
      Delimiter: '/',
      FetchOwner: true 
    };
    s3.listObjectsV2(s3params, function (err, data) {
      if (err) {
        if (err.code === 'NoSuchBucket') {
          res.send({Result: 'The bucket does not exist'});
        } 
        else {
          res.send(err, err.stack);    
        } 
      } else {                
        const commonPrefixes = data.CommonPrefixes 
        const objects = data.Contents.map(obj => ({
          Key: obj.Key,        
          Size: formatSizeUnits(obj.Size),        
          Type: obj.Type,
          LastModified: obj.LastModified,
          StorageClass: obj.StorageClass,     
          Type: obj.ContentType,
          Owner: obj.Owner.DisplayName
        }));
        res.send({commonPrefixes, objects});      
    }});     
  });
  

  // Metadata of the object 
  exports.router.post('/getmetadata', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,      
      Key: payload.Key
    };
    s3.headObject(params, function(err, data) {      
      if (err) {
        if (err.code === 'NotFound') {
          res.send({Result: 'The bucket or object does not exist'});
        }         
        else {
          res.send(err, err.stack);    
        }
      } 
      else {
        res.send({Value: data.ContentType});          
      }
    });
  }); 

  // Object Headers
  exports.router.post('/getHeadObjects', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Key: payload.Key
    };
    s3.headObject(params, function (err, data) {
      if (err) {
        if (err.code === 'ReferenceError') {
          res.send({Result: 'The bucket or object does not exist'});
        } 
        if (err.code === 'NotFound') {
          res.send({Result: 'The object does not exist'});
        }
        else {
          res.send(err, err.stack);    
        }
      } else {  
        var date_time = new Date();
        var date = date_time.toUTCString()         
        const objects = {
          AcceptRanges: data.AcceptRanges,
          LastModified: data.LastModified.toUTCString(),
          ContentLength: data.ContentLength,
          ETag: data.ETag,
          ContentType: data.ContentType,
          ServerSideEncryption: data.ServerSideEncryption,
          VersionId: data.VersionId,
          Date: date,
          Server: data.Server
          // RequestID: data.$response.extendedRequestId
        }    
        res.send(objects);        
      }
    });
  })

  // To Get Access Control List for Objects.
  exports.router.post('/getAccessControlList', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,      
      Key: payload.Key
    };
    s3.getObjectAcl(params, function (err, data) {
      if (err) {
        res.send(err, err.stack);
      } else {
        res.send(data.Grants);
      }
    });
  })

  // To retrieve tag set of an object
  exports.router.post('/getObjectTag', async (req, res) => {    
    const payload = req.body;
    const objectKey = payload.Key;
    const folderName = payload.folderPath; // Give empty string ("") to handle folder nullable.
    const params = {
      Bucket: payload.Bucket,     
      Key: folderName + objectKey // concatenate folder name and object key
    };
    s3.getObjectTagging(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchKey') {
          res.send({Result: 'The object does not exist'});
        } 
        if (err.code === 'NoSuchBucket') {
          res.send({Result: 'The bucket does not exist'});
        }
        else {
          res.send(err, err.stack);    
        } 
      } else {
        const tagSet = data.TagSet
        if (Array.isArray(tagSet) && tagSet.length) {
          res.send({ Result: tagSet });
        }
        else {
          res.send({ Result: 'No tags associated with this resource.' });
        }
      }
    });
  })

  // To get Object URL
  exports.router.post('/getObjectURL', async (req, res) => {
    const payload = req.body
    const params = {
      Bucket: payload.Bucket,
      Key: payload.Key
    };
    const url = s3.getSignedUrl('getObject', params);
    const newUrl = url.split('?')[0];
    res.send({ ObjectURL: newUrl });
  });

  //To get Object URI 
  exports.router.post('/getObjectURI', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.bucket,
      Key: payload.key
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const uri = `s3://${params.bucket}/${params.key}`;
        res.send({ S3URI: uri });
      }
    });
  })

  //Get object properties
  exports.router.post('/getObjectProperties', async (req, res) =>{
    const payload = req.body;
    const params = {
      Bucket: payload.bucket,     
      Key: payload.key,      
    };
    s3.getObject(params, function(err, data) {
      if (err) {
        res.send(err, err.stack); 
      }
      else {            
        const objects = {
          Name: params.Key,
          ETag: data.ETag,
          ServerSideModified: data.LastModified.toUTCString(),
          Owner: data.Owner,
          Size: formatSizeUnits(data.ContentLength),         
          ServerSideEncryption: data.ServerSideEncryption,
          StorageClass: data.StorageClass,  
          Type: data.ContentType        
        }
        res.send(objects)
      }   
    });
  });

  //Get Object Attributes
  // exports.router.post('/getObjectAttributes', async (req, res) => {
  //   const payload = req. body;
  //   const params = {
  //     Bucket: payload.bucket,
  //     Key: payload.key,
  //     ObjectAttributes: [ ETag || Checksum ]
  //   }
  //   s3.getObjectAttributes(params, function(err, data) {
  //     if (err) {
  //       res.send(err, err.stack); 
  //     }
  //     else {
  //       res.send(data);           
  //     }
  //   });
  // })

  //Delete single object
  exports.router.get('/deleteObject', async (req, res) => {
    const payload = req.body;
    const command = new s3Conn.DeleteObjectCommand({
      Bucket: payload.Bucket,
      Key: payload.Key,
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


