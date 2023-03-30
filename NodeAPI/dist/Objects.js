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

  //List all the objects and folders with in a bucket.
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

  //To get objects within a folder with meta data
  exports.router.post('/getfolderobjects', (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Prefix: payload.folderPath,
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        res.send(err, err.stack);
      } else {
        const objects = data.Contents.map(obj => ({
          key: obj.Key.split(payload.folderPath)[1], // Split the key by the prefix and take the second element          
          size: obj.Size,
          lastModified: obj.LastModified,
          metadata: obj.Metadata,
          owner : obj.Owner,
          StorageClass: obj.StorageClass,
          ETag: obj.ETag
        }));
        res.send(objects);
      }
    });
  });


  //Meta data
  exports.router.post('/getmetadata', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Key: payload.Key
    };
    try {
      const command = new s3Conn.HeadObjectCommand(params);
      const response = await client.send(command);
      res.send(response);
    }
    catch (err) {      
      res.send(err);
    }
  });


  //Folder properties
  exports.router.post('/getfolderproperties', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Prefix: payload.folderPath,
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        res.send(err);
      } else {
        const objects = data.Contents;
        // Folder properties
        const totalObjects = objects.length;
        const totalFiles = objects.filter(obj => !obj.Key.endsWith('/')).length;
        const totalFolders = objects.filter(obj => obj.Key.endsWith('/')).length;
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
        const totalSize = objects.reduce((acc, obj) => acc + obj.Size, 0);
        const formattedSize = formatSizeUnits(totalSize);

        // File types
        const fileTypes = {};
        objects.filter(obj => !obj.Key.endsWith('/')).forEach(obj => {
          const fileType = obj.Key.split('.').pop();
          fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
        });

        // Server-side modified and owners
        const modifiedDates = objects.map(obj => obj.LastModified);
        // const owners = objects.map(obj => obj.Owner.DisplayName);

        // Storage classes
        const storageClasses = {};
        objects.forEach(obj => {
          const storageClass = obj.StorageClass;
          storageClasses[storageClass] = (storageClasses[storageClass] || 0) + 1;
        });

        // return folder properties
        const response = {
          Name: payload.folderPath,
          TotalObjects: totalObjects,
          TotalFiles: totalFiles,
          TotalFolders: totalFolders,
          TotalSize: formattedSize,
          FileTypes: fileTypes,
          ModifiedDates: modifiedDates,
          // Owner : owners,
          StorageClasses: storageClasses
        };
        res.send(response);
      }
    });
  });

  // Object Headers
  exports.router.post('/getHeadObjects', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket : payload.Bucket,
      Key : payload.Key
    };
    s3.headObject(params, function(err, data) {
      if (err) {
        res.send(err, err.stack); 
      }
      else {
        res.send(data);         
      }    
    });
  })

  // To Get Access Control List for Objects.
  exports.router.post('/getAccessControlList', async (req, res) =>{
    const payload = req.body;
    const params = {
      Bucket : payload.Bucket,
      Key : payload.Key
    };
    s3.getObjectAcl(params, function(err, data) {
      if (err) {
        res.send(err, err.stack); 
      } else {
        res.send(data);   
      }           
    });
  })

  // To retrieve tag set of an object
  exports.router.post('/getObjectTag', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket : payload.Bucket,
      Key : payload.Key,
    };
    s3.getObjectTagging(params, (err, data) =>{
      if (err){
        res.send(err, err.stack);
      } else {        
         const tagSet = data.TagSet
         if (Array.isArray(tagSet) && tagSet.length)
          {
            res.send({Result: tagSet});            
          }
          else{
            res.send ({Result: 'No tags associated with this resource.'});
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
    res.send(newUrl);
  });

  
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


