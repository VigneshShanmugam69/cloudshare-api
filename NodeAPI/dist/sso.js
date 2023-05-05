const authClient = require('@okta/okta-auth-js');
const okta=require("@okta/okta-sdk-nodejs")
const express = require("express");
const axios = require('axios');
const AWS = require('aws-sdk');
const { readBuilderProgram } = require('typescript');
const sts = new AWS.STS();
exports.router = (express.Router)();

exports.router.post('/authenticateUser', async (req, res) => {
    var response = await authenticateUser(req.body.Username, req.body.Password);
    res.send({ result: response });
});

async function authenticateUser(Username, Password) {
    try {
        var oktaAuth = new authClient.OktaAuth({
            issuer: 'https://dev-99932483.okta.com/oauth2/default',
            scopes: ['license:write'],
            cookies: {
                sessionCookie: true
            }
            //clientId: '0oa8fti7ep1F8OW0B5d7',
        });

        var response = await oktaAuth.signInWithCredentials({
            username: Username,
            password: Password
        });

        let obj = {
            "status": 1,
            "message": "User authenticated successfully",
            "userDetails": response
        }
        return obj;

    }
    catch (err) {
        let obj = {
            "status": 0,
            "message": "Invalid username or password",
        }
        return obj;
    }
}

exports.router.post('/deleteUser',async(req,res)=>{
  try {
    const oktaOrgUrl = 'https://dev-99932483.okta.com';
        const oktaApiClientToken = '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd';
    const oktaClient = new okta.Client({
                orgUrl: oktaOrgUrl,
                issuer: 'https://dev-99932483.okta.com/oauth2/default',
                // clientId:'0oa96jm6l9Xbt6lmy5d7',
                token: oktaApiClientToken,
                redirectUri:'http:/localhost:4201/',
                scopes: ['openid', 'profile', 'email'],
                audience: 'api://default',
              });

oktaClient.oauth.accessToken
              const oktaauth = new authClient.OktaAuth({
                orgUrl: oktaOrgUrl,
                issuer: 'https://dev-99932483.okta.com/oauth2/default',
                // clientId:'0oa96jm6l9Xbt6lmy5d7',
                token: oktaApiClientToken,
                redirectUri:'http:/localhost:4201/',
                scopes: ['openid', 'profile', 'email'],
                audience: 'api://default',
              });


          
              let payload={
                groupId: '00g8tq4c8fdkgGFvF5d7',
                userId: '00u8eruhh9CiehWSR5d7'
              }
           const result= await oktaClient.removeUserFromGroup(
            groupId= '00g8tq4c8fdkgGFvF5d7',
            userId= '00u8tpyt9rv5SQaSk5d7'
          );
           let response={
            "status":1,
            "message":'Removed successfully'
           }
           res.send(response)
  } catch (error) {
    let response={
      "status":2,
      "message":error
     }
     res.send(response)
  }
});


exports.router.post('/generateSmalassertion',async(req,res)=>{
 try {
   const oktaOrgUrl = 'https://dev-99932483.okta.com';
   const oktaApiClientToken = '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd';
   const oktaClient = new okta.Client({
     orgUrl: oktaOrgUrl,
     issuer: 'https://dev-99932483.okta.com/oauth2/default',
     clientId:'0oa96jm6l9Xbt6lmy5d7',
     token: oktaApiClientToken,
     redirectUri:'http:/localhost:4201/',
     scopes: ['openid', 'profile', 'email'],
     audience: 'api://default',
   });
//  const a= new oktaClient.oauth.accessToken;      
 const s= await authClient.authenticate({
  orgUrl: oktaOrgUrl,
  token: oktaApiClientToken,
  username:'vigneshshanmugam9@gmail.com',
password:'Vignesh@9'}
 )
 res.send(s);
 } catch (error) {
  res.send(error.message);
 }
});


exports.router.post('/getCredentials', async (req, res) => {
  try {
    const org=new AWS.Organizations({region:'us-east-1'})
   await org.listAccounts({}, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
          console.log('List of accounts:');
          console.log(data);
          data.Accounts.forEach(account => {
            console.log(`${account.Name} (${account.Id})`);
          });
        }
      });

      const sts = new AWS.STS();

const accountId = '977258277033'; // Replace with the AWS account ID you want to assume a role in
const roleName = 'myRole'; 
const params = {
  RoleArn: `arn:aws:iam::${accountId}:role/${roleName}`,
  RoleSessionName: 'mySession'
};

await sts.assumeRole(params, function(err, data) {
  if (err) {
    console.log('Error assuming role', err);
  } else {
    const accessKeyId = data.Credentials.AccessKeyId;
    const secretAccessKey = data.Credentials.SecretAccessKey;
    const sessionToken = data.Credentials.SessionToken;
    console.log(`Access key ID: ${accessKeyId}`);
    console.log(`Secret access key: ${secretAccessKey}`);
    console.log(`Session token: ${sessionToken}`);
  }
});
res.send('success');

//   const sso=new AWS.SSO();
//   sso.listAccounts((err,data)=>{
// if(err){
//     res.send(err);
// }
// res.send(data);
//   });

        // res.send(accesstoken);
  } catch (error) {
    res.send(error);
  }
});


  //   const oktaOrgUrl = 'https://dev-99932483.okta.com';
//       const oktaApiClientToken = '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd';
//       const oktaUsername = 'vigneshshanmugam9@gmail.com';
//       const oktaPassword = 'Vignesh@9';
//       const ssoInstanceArn = 'arn:aws:sso:::instance/ssoins-7223f68b1e33a57f';
//       const storeId = 'd-90677f5a16';

//   const oktaClient = new authClient.OktaAuth({
//           orgUrl: oktaOrgUrl,
//           issuer: 'https://dev-99932483.okta.com/oauth2/default',
//           clientId:'0oa96jm6l9Xbt6lmy5d7',
//           token: oktaApiClientToken,
//           // redirectUri:'http:/localhost:4201/',
//           scopes: ['openid', 'profile', 'email'],
//           audience: 'api://default',
//         });
//       var options={
//         orgUrl: oktaOrgUrl,
//         issuer: 'https://dev-99932483.okta.com/oauth2/default',
//         clientId:'0oa96jm6l9Xbt6lmy5d7',
//         token: oktaApiClientToken,
//         scopes: ['openid', 'profile', 'email'],
//         audience: 'api://default',
//         pkce:true,
//     grant_type:'authorization_code'
//       };

//         const accesstoken= oktaClient.getAccessToken(options);
// const token=await authClient.getToken(options)



      // await sts.assumeRole({
      //   RoleArn: `arn:aws:iam::${ssoInstanceArn}:role/aws-reserved/sso.amazonaws.com/${storeId}`,
      //   RoleSessionName: 'my-session',
      //   DurationSeconds: 3600 // Set the duration of the temporary credentials
      // }, (err, data) => {
      //   if (err) {
      //     console.error(err);
      //     return;
      //   }
      //   console.log(data)
      //   const s3 = new AWS.S3({
      //       accessKeyId: data.Credentials.AccessKeyId,
      //       secretAccessKey: data.Credentials.SecretAccessKey,
      //       sessionToken: data.Credentials.SessionToken
      //     });});

      // const oktaClient = new authClient.OktaAuth({
      //     orgUrl: oktaOrgUrl,
      //     issuer: 'https://dev-99932483.okta.com/oauth2/default',
      //     clientId:'0oa91fv3ncEaofktD5d7',
      //     token: oktaApiClientToken
      //   });
        
      //   const oktaCredentials = {
      //     username: oktaUsername,
      //     password: oktaPassword
      //   };

  
      //   const response=await oktaClient.signInWithCredentials(oktaCredentials)

      //   const config = {
      //       headers: {
      //         'Authorization': 'SSWS ' + response.sessionToken
      //       }
      //     };

     

      //   const accessToken=await oktaClient.token.getUserInfo(response.sessionToken)






// const response1=await  axios.post('https://dev-99932483.okta.com/api/v1/sessions/me', {}, config)
// .then(response => {
//   console.log(response);
//   const accessToken = response.data.access_token.token;
//   // Use the access token as needed
// })
// .catch(error => {
//   console.error(error);
// });
// console.log(response1)
