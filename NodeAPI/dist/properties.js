
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
  const totalfileSize = await getTotalSize();
  const Bucketlogging = await getBucketLogging();
  const bucketversion = await getBucketVersionig();
  const tranferAcceleration = await getBucketAccelerate();
  const ServerSideEncryption = await BucketServersideEncryption();
  const getBucketRequestPayment = await requespays();
  const bucketmodificationDate=await bucketmodification();
  const bucketReplication =await bucketreplication();
  //const filetypes = await typefile();
  const region=await bucketLocation();
  const StorageType =await bucketstorageclass();
  const totalobject=await noobj();

  res.send({
    owner, bucketName, totalFolder, totalfileSize, Bucketlogging, bucketversion, tranferAcceleration,totalobject,
    ServerSideEncryption, getBucketRequestPayment,bucketmodificationDate,region,bucketReplication,StorageType
  })
});


 //owner
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



 //Bucket name
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



 // total folder
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

//Total file size
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

//Bucket logging
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

  //Bucket versining
function getBucketVersionig() {
 return new Promise((resolve, reject) => {

    s3.getBucketVersioning(params, (err, data) => {
      if (err)
       {
        resolve(err, err.stack);
      } 
      else 
      {
        //console.log('Bucket versioning configuration:');
        resolve({ data });
      }
    });
  }
  )
}


//BucketAccelerate
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



 // server side encryption
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


  //reques pays
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



//bucket modification
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

//bucket location
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

//replication
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

// storage class 
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

// no of obj
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




























