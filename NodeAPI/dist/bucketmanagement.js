
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

//Thist for bucket management replication API
exports.router.post('/bucketreplication', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket
  }

  const bucketReplication = await bucketreplication()
  res.send({ bucketReplication })
   function bucketreplication() {
    return new Promise((resolve, reject) => {
      s3.getBucketReplication({ Bucket: params.Bucket }, (err, data) => {
        if (err) {
          let status = {
            "Message": "no bucket Replication",
          }

          resolve(status);
        }
        else 
        {
          let a = data.ReplicationConfiguration.Rules
          let list = [];
          for (var i = 0; i < a.length; i++) {
          let output = {
              "ReplicationRoles": data.ReplicationConfiguration.Role,
              "bucketreplicationID": data.ReplicationConfiguration.Rules[i].ID,
              "ReplicationPriority": data.ReplicationConfiguration.Rules[i].Priority,
              "ReplicationPrefix": data.ReplicationConfiguration.Rules[i].Filter.Prefix,
              "ReplicationStatus": data.ReplicationConfiguration.Rules[i].Status,
              "ReplicationDestinationBucket": data.ReplicationConfiguration.Rules[i].Destination.Bucket,
              "ReplicationDeleteMarkerReplicationstatus": data.ReplicationConfiguration.Rules[i].DeleteMarkerReplication.Status,
            }
            list.push(output);
           }
          resolve(list)

          } 
      });
    })
  }
 });


//Thist for bucket management Lifecycle' API
exports.router.post('/BucketLifecycle', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket

  }
  const BucketLifecycle = await listBucketLifecycle()
  res.send({ BucketLifecycle })

  function listBucketLifecycle() {
    return new Promise((resolve, reject) => {
      s3.getBucketLifecycleConfiguration(params, function (err, data) {
        if (err) 
        {
          let status = {
            "message": "no BucketLifecycle",
          }
          resolve(status);
        } 
        else 
        {
          let a = data.Rules
          let list = [];
          for (var i = 0; i < a.length; i++) {
            let result = {
              "BucketLifecycleID": data.Rules[i].ID,
              "BucketLifecyclePrefix": data.Rules[i].Filter.Prefix,
              "BucketLifecycleStatus": data.Rules[i].Status,
              "BucketLifecycleTransitionsDays": data.Rules[i].Transitions[0].Days,
              "BucketLifecycleStorageClass": data.Rules[i].Transitions[0].StorageClass,
              "NoncurrentVersionransitions": data.Rules[i].NoncurrentVersionTransitions
            }
            list.push(result);
          }
          resolve(list);
        }
      })
    }
    )
  }
});

//Thist for bucket management Inventory' API
exports.router.post('/BucketInventory', async (req, res) => {
  const params = {
    Bucket: req.body.Bucket

  }
  const BucketInventory = await Inventory()
  res.send({ BucketInventory })

  function Inventory() {
    return new Promise((resolve, reject) => {
      s3.listBucketInventoryConfigurations(params, function (err, data) {
        if (err) {
          let status = {
            "message": "no InventoryConfigurationList"
          }
          resolve(status)
        } else {
          var list = []
          var a = data.InventoryConfigurationList
          if (a.length != 0) {
            for (let i = 0; i < a.length; i++) {
              let result = {
                "DestinationAccountID": data.InventoryConfigurationList[i].Destination.S3BucketDestination.AccountId,
                "Bucket": data.InventoryConfigurationList[i].Destination.S3BucketDestination.Bucket,
                "Format": data.InventoryConfigurationList[i].Destination.S3BucketDestination.Format,
                "Prefix": data.InventoryConfigurationList[i].Destination.S3BucketDestination.Prefix,
                "id": data.InventoryConfigurationList[i].Id,
                "IncludedObjectVersions": data.InventoryConfigurationList[i].IncludedObjectVersions,
                "IsEnabled": data.InventoryConfigurationList[i].IsEnabled
              }
              list.push(result)
            }
          }
          else {
            let results = {
              Message: " No InventoryConfiguration"
            }
            list.push(results)
          }
          resolve(list)

        }
      });

    })
  }
});