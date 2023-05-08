  const express_1 = require("express");
  exports.router = (0, express_1.Router)();
  const AWS = require('aws-sdk');
  const path = require('path');
  //const moment = require('moment');

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
      Delimiter: '/',
      MaxKeys: 1000,
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchBucket') {
          res.send({ Result: 'The bucket does not exist' });
        }
        else {
          res.send(`${err}`);
        }
      } else {
        const commonPrefixes = data.CommonPrefixes;
        const parentFolder = params.Prefix;
        const folderNames = [];
        const parentFolderLength = parentFolder.length;
        for (let i = 0; i < commonPrefixes.length; i++) {
          const prefix = commonPrefixes[i].Prefix;
          const folderName = prefix.substring(parentFolderLength, prefix.length - 1) + '/';
          const folderObj = {
            Prefix: folderName
          }
          folderNames.push(folderObj)
        }
        const filteredContents = data.Contents.filter((content) => content.Size > 0);  //To skip keys with no values 
        const objects = filteredContents.map(obj => ({
          Key: obj.Key.split(payload.folderPath)[1], // Split the key by the prefix and take the second element          
          Size: formatSizeUnits(obj.Size),
          LastModified: obj.LastModified.toUTCString(),
          Metadata: obj.Metadata,
          Owner: obj.Owner,
          StorageClass: obj.StorageClass,
          ETag: obj.ETag,
        }));
        res.send({ folderNames, objects });
      }
    });
  });


  //Folder properties
  exports.router.post('/getfolderproperties', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Prefix: payload.folderPath,
      FetchOwner: true
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
        var fileTypes = [];       
        objects.filter(obj => !obj.Key.endsWith('/')).forEach(obj => {
          const extname = path.extname(obj.Key);  
          const extensionWithoutDot = extname.substring(1); 
          if (!fileTypes.includes(extensionWithoutDot)) {
           fileTypes.push(extensionWithoutDot);
         }
        });            
        function joinDemo() {
          fileTypes = fileTypes.join(", ");   //To pass the output as a string
        }        
        joinDemo();

        const modifiedDates = objects.map(obj => obj.LastModified);
        const maxDate = new Date(Math.max.apply(null,modifiedDates));
        const minDate = new Date(Math.min.apply(null,modifiedDates));
        const max = moment(maxDate).format('DD-MM-YYYY hh:mm:ss A'); 
        const min = moment(minDate).format('DD-MM-YYYY hh:mm:ss A'); 
        const LastModified = max + ' - ' + min
        
        //Owner
        var Owner = [];
        objects.forEach(obj => {
          const owner = obj.Owner.DisplayName
          if (!Owner.includes(owner)) {
            Owner.push(owner);
          }
        }); 
        function joinDemo1() {
          Owner = Owner.join(", ");   //To pass the output as a string
        }        
        joinDemo1();

        // Storage classes
        var storageClasses = [];
        objects.forEach(obj => {
          const storageClass = obj.StorageClass;
          if (!storageClasses.includes(storageClass)) {
            storageClasses.push(storageClass);
          }
        });
        function joinDemo2() {
          storageClasses = storageClasses.join(", ");   //To pass the output as a string
        }        
        joinDemo2();

        // return folder properties
        const response = {
          Name: payload.folderPath,
          TotalObjects: totalObjects,
          TotalFiles: totalFiles,
          TotalFolders: totalFolders,
          TotalSize: formattedSize,
          FileTypes: fileTypes,
          ModifiedDates: LastModified,
          Owner : Owner,
          StorageClasses: storageClasses
        };
        res.send(response);
      }
    });
  });

  // Folder Headers
  exports.router.post('/getFolderHeaders', async (req, res) => {
    const payload = req.body;
    const params = {
      Bucket: payload.Bucket,
      Key: payload.folderPath
    };
    s3.headObject(params, function (err, data) {
      if (err) {
        if (err.code === 'ReferenceError') {
          res.send({ Result: 'The bucket or object does not exist' });
        }
        if (err.code === 'NotFound') {
          res.send({ Result: 'The folder path does not exist' });
        }
        else {
          res.send(err, err.stack);
        }
      } else {
        var date_time = new Date();
        var date = date_time.toUTCString();
        const objects = {
          ServerSideEncryption: data.ServerSideEncryption,
          VersionId: data.VersionId,
          AcceptRanges: data.AcceptRanges,
          ContentLength: data.ContentLength,
          ContentType: data.ContentType,
          Date: date,
          ETag: data.ETag,
          LastModified: data.LastModified.toUTCString(),
          Server: data.Server,
          RequestID: data.Metadata['x-amz-request-id'],
          xamzid2: data.Metadata['x-amz-id-2']
        };
        res.send({ Header: objects });
      }
    });
  });

  // Folder Overview
  exports.router.post('/getFolderLocation', async (req, res) => {
    const payload = req.body;
    var params = {
      Bucket: payload.bucket
    };
    s3.getBucketLocation(params, function (err, data) {
      if (err) {
        res.send(`${params.Bucket}: ${err}`);
      }
      else {
        const region = data.LocationConstraint || 'us-east-1';
        res.send({ AWSRegion: region })
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
      res.send({ S3URI: folderURI });
    });     