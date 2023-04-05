  const express_1 = require("express");
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

  //To get objects within a folder with meta data
  exports.router.post('/getfolderobjects', (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Prefix: payload.folderPath,
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        res.send(`${err}`);
      } else {                 
        const objects = data.Contents.map(obj => ({
          Key: obj.Key.split(payload.folderPath)[1], // Split the key by the prefix and take the second element          
          Size: formatSizeUnits(obj.Size),
          LastModified: obj.LastModified.toUTCString(),
          Metadata: obj.Metadata,
          Owner: obj.Owner,
          StorageClass: obj.StorageClass,
          ETag: obj.ETag,
        }));
        res.send(objects);
      }
    });
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
        res.send(`${err}`);
      } else {
        const objects = data.Contents;
        // Folder properties
        const totalObjects = objects.length;
        const totalFiles = objects.filter(obj => !obj.Key.endsWith('/')).length;
        const totalFolders = objects.filter(obj => obj.Key.endsWith('/')).length;
        // Convert file size B into KB, MB, GB       
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

  //Folder Headers
  // exports.router.post('/getFolderHeaders', async (req, res) => {
  //   const bucketName = 'cloudstier-plakshmanan-demo-001';
  //   const folderName = 'Pavi/';
  //   const params = {
  //     Bucket: bucketName,
  //     Prefix: folderName,
  //     Delimiter: '/',
  //     MaxKeys: 0     
  //   };
  //   s3.headObject(params, function(err, data) {
  //     if (err) {
  //       console.log(err, err.stack);
  //     } else {
  //       console.log(data);
  //     }
  //   });
  // });

  // Folder Overview
  exports.router.post('/getFolderLocation', async (req, res) => {
    const payload = req.body;
    var params = {
      Bucket: payload.bucket
     };
     s3.getBucketLocation(params, function(err, data) {
       if (err) {
        res.send(`${params.Bucket}: ${err}`);
       }
       else {
        const region = data.LocationConstraint || 'us-east-1';    
        res.send({AWSRegion: region})    
       }     
     });
  });

    //To get Object URI 
    exports.router.post('/getFolderURI', async (req, res) => {
      const payload = req.body;
      const params = {
        bucketName: payload.bucket,
        folderPath: payload.folderPath
      };
      const folderURI = `s3://${params.bucketName}/${params.folderPath}`;
      res.send({S3URI: folderURI});
    })
