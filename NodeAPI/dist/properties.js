
const AWS = require('aws-sdk');
const ex = require('express');
exports.router = (0, ex.Router)();


// Create S3 client object
const s3 = new AWS.S3({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA6HCJB5CURVIR3QW7',
    secretAccessKey: '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'
  }
});


exports.router.post('/properties', async (req, res) => {
  //const payload=req.body;
  const params = {
    Bucket: req.body.Bucket

  };

  const owner = await (getBucketAcl());
  const bucketName = await getBucketName();
  const bucketLogging = await getBucketLogging();
  const bucketVersion = await getBucketVersionig();
  const tranferAcceleration = await getBucketAccelerate();
  const serversideEncryption = await BucketServersideEncryption();
  const getBucketRequestPayment = await requespays();
  const bucketmodificationDate = await bucketmodification();
  //const filetypes = await typefile();
  const region = await bucketLocation();

  Promise.all([{
    owner, bucketName, bucketVersion, tranferAcceleration, serversideEncryption,
    getBucketRequestPayment, bucketmodificationDate, region, bucketLogging
  }])
    .then(results => res.send(results));

  // res.send({
  //   owner, bucketName, totalFolder, totalFileSize, bucketLogging, bucketVersion, tranferAcceleration, totalObject,
  //   serversideEncryption, getBucketRequestPayment, bucketmodificationDate, region, bucketReplication, storageType,
  // })

  //To get owner of the bucket 
  function getBucketAcl() {
    return new Promise((resolve, reject) => {
      s3.getBucketAcl(params, (err, data) => {
        if (err) {
          resolve(err);

        }
        else {
          const owner = data.Owner;
          resolve(owner.DisplayName);

        }
      });
    })
  }
  //To get  name of the bucket
  function getBucketName() {
    return new Promise((resolve, reject) => {
      s3.listBuckets((err, data) => {
        if (err) {
          resolve(err);
        } else {
          const bucket = data.Buckets.find(bucket => bucket.Name === params.Bucket);
          resolve(` ${bucket.Name}`);

        }
      });

    })
  }
  //To check bucketLogging status
  function getBucketLogging() {
    return new Promise((resolve, reject) => {
      s3.getBucketLogging(params, (err, data) => {
        if (err) {
          resolve(err, err.stack);
        }
        else {

          resolve(data.LoggingEnabled);
        }
      });
    })
  }

  //To check   BucketVersining status
  function getBucketVersionig() {
    return new Promise((resolve, reject) => {

      s3.getBucketVersioning(params, (err, data) => {
        if (err) {
          resolve(err, err.stack);
        }
        else {

          resolve(data.Status);
        }
      });
    }
    )
  }

  //To check BucketAccelerate  status 
  function getBucketAccelerate() {
    return new Promise((resolve, reject) => {

      s3.getBucketAccelerateConfiguration(params, function (err, data) {

        if (err) {
          resolve(err, err.stack);
        } else {
          var result = data.Status
          resolve(result);
        }
      });
    }
    )
  }
  // To check server side encryption status of bucket
  function BucketServersideEncryption() {
    return new Promise((resolve, reject) => {
      s3.getBucketEncryption(params, (err, data) => {
        if (err) {
          resolve(err);
        }
        else {
          resolve(data.ServerSideEncryptionConfiguration.Rules[0].BucketKeyEnabled);
        }
      });
    }
    )
  }

  //To find the requesterPay status
  function requespays() {
    return new Promise((resolve, reject) => {
      s3.getBucketRequestPayment(params, (err, data) => {
        if (err) {
          resolve(err);
        }
        else {
          const requesterPays = data.Payer === 'Requester';
          resolve(requesterPays);
        }
      });
    }
    )
  }

  //Check lastModification of the bucket
  function bucketmodification() {
    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, function (err, data) {
        if (err) {
          resolve(err, err.stack);
        }
        else {
          resolve(` ${data.Contents[0].LastModified}.`);
        }
      });
    }
    )
  }

  //get bucketLocation
  function bucketLocation() {
    return new Promise((resolve, reject) => {
      s3.getBucketLocation(params, (err, data) => {
        if (err) {
          resolve(`Error retrieving location for bucket ${params.Bucket}: ${err}`);
        }
        else {
          const region = data.LocationConstraint || 'us-east-1';
          resolve(` ${region}`);
        }
      });
    }
    )
  }
});

//This Api for to calculate total number of folder

exports.router.post('/totalfolder', async (req, res) => {
  const params1 = {
    Bucket: req.body.Bucket,
    Prefix: '',
    Delimiter: '/',

  }
  const TotalFolder = await gettotalfolder();
  res.send({ TotalFolder })

  function gettotalfolder() {

    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params1, function (err, data) {
        if (err) {
          resolve(err, err.stack);
        }
        else {
          resolve(` ${data.CommonPrefixes.length}`);

        }
      });

    })
  }
})

//This Api for to calculate total number of object
exports.router.post('/totalobject', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket

  };

  const TotalObject = await noobj();
  res.send({ TotalObject })
  function noobj() {
    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          resolve(err);
        } else {
          resolve(` ${data.Contents.length}`);
        }
      });

    }
    )
  }

})

//calculate total fileSize of bucket objects

exports.router.post('/totalfilesize', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket

  };
  const TotalfileSize = await getTotalSize()
  res.send({ TotalfileSize })

  function getTotalSize() {
    return new Promise((resolve, reject) => {
      let totalSize = 0;

      const listObjects = (params) => {
        s3.listObjectsV2(params, (err, data) => {
          if (err) {
            resolve(err);
          }
          else {
            data.Contents.forEach((object) => {
              totalSize += object.Size;
            });

            if (data.IsTruncated) {
              params.ContinuationToken = data.NextContinuationToken;
              listObjects(params);
            } else {
              const totalSizeMB = totalSize / (1024 * 1024);
              resolve(` ${totalSizeMB.toFixed(2)} MB (${totalSize} bytes)`);
            }
          }
        });
      };

      listObjects(params);
    })
  }
})

// To find bucket storage class 
exports.router.post('/storageclass', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket

  };
  const Storageclass = await storageclass()
  res.send({ Storageclass })
  function storageclass() {
    return new Promise((resolve, reject) => {
      s3.getBucketLifecycleConfiguration(params, (err, data) => {
        if (err) {
          resolve('standard');
        }
        else {
          const storageClass = data.Rules[0].Transitions[0].StorageClass;
          resolve(` ${storageClass}`);
        }
      });

    }
    )
  }
})