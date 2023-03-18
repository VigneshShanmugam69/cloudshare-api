
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

const params = {
  Bucket: 'cloudstier-tgandhi-demo-001',

};

const params1 = {
  Bucket: 'cloudstier-tgandhi-demo-001',
  Prefix: '',
  Delimiter: '/',

};



exports.router.get('/properties', async (req, res) => {

  const owner = await getBucketAcl();
  const bucketName = await getBucketName();
  const totalFolder = await gettotalfolder();
  const totalFileSize = await getTotalSize();
  const bucketLogging = await getBucketLogging();
  const bucketVersion = await getBucketVersionig();
  const tranferAcceleration = await getBucketAccelerate();
  const serversideEncryption = await BucketServersideEncryption();
  const getBucketRequestPayment = await requespays();
  const bucketmodificationDate=await bucketmodification();
  const bucketReplication =await bucketreplication();
  //const filetypes = await typefile();
  const region=await bucketLocation();
  const storageType =await bucketstorageclass();
  const totalObject=await noobj();

  res.send({
    owner, bucketName, totalFolder, totalFileSize, bucketLogging, bucketVersion, tranferAcceleration,totalObject,
    serversideEncryption, getBucketRequestPayment,bucketmodificationDate,region,bucketReplication,storageType
  })
});


 //To get owner of the bucket 
function getBucketAcl() {
 return new Promise((resolve, reject) => {
    s3.getBucketAcl(params, (err, data) => {
      if (err)
       {
        resolve(err);
      
      } 
      else 
      {
        const owner = data.Owner;
        resolve(owner);
      }
    });
  })
}



 //To get  name of the bucket
function getBucketName() {
 return new Promise((resolve, reject) => {
    s3.listBuckets((err, data) => {
      if (err) 
      {
        resolve(err);
      } else
       {
        const bucket = data.Buckets.find(bucket => bucket.Name === params.Bucket);
        resolve(` ${bucket.Name}`);
      }
    });

  })
}



 // calculate total number of folder in a bucket
function gettotalfolder() {
 
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params1, function (err, data) {
      if (err) 
      {
       resolve(err, err.stack);
      }
       else
        {
        resolve(` ${data.CommonPrefixes.length}`);

      }
    });

  })
}

//calculate total fileSize of bucket objects
function getTotalSize() {
   return new Promise((resolve, reject) => {
    let totalSize = 0;

    const listObjects = (params) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err)
         {
          resolve(err);
        } 
        else 
        {
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

//To check bucketLogging status
function getBucketLogging() {
   return new Promise((resolve, reject) => {
    s3.getBucketLogging(params, (err, data) => {
      if (err)
       {
        resolve(err, err.stack);
      } 
      else 
      {

        resolve(data);
      }
    });
  })
}

  //To check   BucketVersining status
function getBucketVersionig() {
 return new Promise((resolve, reject) => {

    s3.getBucketVersioning(params, (err, data) => {
      if (err)
       {
        resolve(err, err.stack);
      } 
      else 
      {
        
        resolve({ data });
      }
    });
  }
  )
}


//To check BucketAccelerate  status 
function getBucketAccelerate() {
   return new Promise((resolve, reject) => {

    s3.getBucketAccelerateConfiguration(params, (err, data) => {
      if (err) {
        resolve(err);
      } else {
        resolve(data);
      }
    });
  }
  )
}



 // To check server side encryption status of bucket
function BucketServersideEncryption() {
 return new Promise((resolve, reject) => {
s3.getBucketEncryption(params, (err, data) => {
      if (err)
       {
        resolve(err);
      } 
      else 
      {
        resolve(data.ServerSideEncryptionConfiguration);
      }
    });
  }
  )
}


  //To find the requesterPay status
function requespays() {
return new Promise((resolve, reject) => {
s3.getBucketRequestPayment(params, (err, data) => {
      if (err)
       {
        resolve(err);
      } 
      else 
      {
        const requesterPays = data.Payer === 'Requester';
        resolve(requesterPays);
      }
    });
  }
  )
}



// function typefile() {
//   // file type

//   return new Promise((resolve, reject) => {

//     s3.listObjectsV2(params, function(err, data) {
//       let obj=[];
//       if (err) {
//         console.log(err, err.stack);
//       } else {
        
//         data.Contents.forEach(obj => {
//           const key = obj.Key;
//           const extension = key.split('.').pop();
//           //console.log(extension)
//           let keyvalue =[]; 
//           keyvalue.push(extension);
//           console.log(keyvalue);
//         }
        
        
//         );
        
        
        
//       }
//     }); 
//   }
//   )
// }



//Check lastModification of the bucket
function bucketmodification() {
return new Promise((resolve, reject) => {
s3.listObjectsV2(params, function (err, data) {
      if (err)
       {
        resolve(err, err.stack);
      } 
      else 
      {
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
      if (err)
       {
        resolve(`Error retrieving location for bucket ${params.Bucket}: ${err}`);
      } 
      else 
      {
        const region = data.LocationConstraint || 'us-east-1';
        resolve(` ${region}`);
      }
    });
     }
  )
}

//check bucket replication status
function bucketreplication() {
return new Promise((resolve, reject) => {
 s3.getBucketReplication({ Bucket: params.Bucket }, (err, data) => {
      if (err)
       {
      resolve('Disable');
      } 
      else 
      {
       resolve(data);
      }
    });
  }
  )
}

// To find bucket storage class 
function bucketstorageclass() {
 return new Promise((resolve, reject) => {
s3.getBucketLifecycleConfiguration(params, (err, data) => {
  if (err)
   {
    resolve('standard');
  }
   else
    {
    const storageClass = data.Rules[0].Transitions[0].StorageClass;
    resolve(` ${storageClass}`);
  }
});

  }
  )
}

// Get total number of object in a bucket
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