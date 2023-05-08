const authClient = require('@okta/okta-auth-js');
const okta=require("@okta/okta-sdk-nodejs")
const express = require("express");
const axios = require('axios');
const AWS = require('aws-sdk');
const { readBuilderProgram } = require('typescript');
const sts = new AWS.STS();
const oktaVerifier = require('@okta/jwt-verifier');
const express = require("express");
const helper = require('./helper/jwt')

exports.router = (express.Router)();

const issuer = 'https://dev-99932483.okta.com/oauth2/default';
const clientID = '0oa96jm6l9Xbt6lmy5d7';
const clientSecret = '';
const apiToken = '008DWbCPRmqViVAJXrcYmeHDEVUTEnatX66-FDQwvd';

exports.router.post('/authenticateUser', async (req, res) => {
    var response = await authenticateUser(req.body.Username, req.body.Password);
    res.send({ result: response });
});

async function authenticateUser(Username, Password) {
    try {
        var oktaAuth = new authClient.OktaAuth({
            issuer: issuer,
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

exports.router.post('/getcredentialssso',async(req,res)=>{

  const startUrl = 'https://awsclouddba.awsapps.com/start#/';
const acsUrl = 'https://us-east-1.signin.aws.amazon.com/platform/saml/acs/d99d4c12-912f-47c5-be29-8014a06b2547';
const signInUrl = 'https://dev-99932483.okta.com/app/amazon_aws_sso/exk91fv3nbxpFiO315d7/sso/saml';
const issuerUrl = 'https://us-east-1.signin.aws.amazon.com/platform/saml/d-90677f5a16';
const signOutUrl = 'https://dev-99932483.okta.com';



const params = {
  accessToken: '7a521649-eafa-4ff8-8e9a-720c5cbd5afc',
  accountId: '977258277033',
  roleName: 'us-east-1' // Replace with your region
};

const sso = new AWS.SSO({ region: 'us-east-1' }); // Replace with your region
const sts = new AWS.STS({ region: 'us-east-1' }); 

sso.getRoleCredentials(params, (err, data) => {
  if (err) {
    console.error(err);
    res.send(err.message)
  } else {
    const roleArn = data.roleCredentials.RoleArn;
    const accessKeyId = data.roleCredentials.accessKeyId;
    const secretAccessKey = data.roleCredentials.secretAccessKey;
    const sessionToken = data.roleCredentials.sessionToken;
    const durationSeconds = 3600;
    let s={
      roleArn,accessKeyId,secretAccessKey,sessionToken,durationSeconds
    }
    res.send(s);
  }


});

})




exports.router.post('/generateSmalassertion',async(req,res)=>{
 try {
  const oktaUsername = 'vigneshshanmugam9@gmail.com';
        const oktaPassword = 'Vignesh@9';
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
  const app=await oktaClient.getApplication('0oa91fv3ncEaofktD5d7')

      const oktaCredentials = {
          username: oktaUsername,
          password: oktaPassword
        };

const sign=await axios.post('https://dev-99932483.okta.com/app/amazon_aws_sso/exk91fv3nbxpFiO315d7/sso/saml',oktaCredentials).then((err,data)=>{
if(err){console.log(err.message);
return err;}
else{
  console.log(data);
  return data;
}
})

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
exports.router.post('/VerifyAccessToken', async (req, res) => {
    var response = await VerifyAccessTokenByAccessToken(req.body.accessToken);
    res.send({ result: response });
});

async function VerifyAccessTokenByAccessToken(accessToken) {
    try {
        const client = new oktaVerifier({
            issuer: issuer,
            clientId: clientID
        })
        const result = await client.verifyAccessToken(accessToken, 'api://default')
            .then((jwt) => {
                return jwt;
            })
            .catch((err) => {
                return err;
            });
        if (result.parsedBody) {
            let currentTime = Math.floor(Date.now() / 1000); // convert current time to Unix timestamp in seconds
            let expiresIn = 3600;  //seconds
            if (result.parsedBody.exp > currentTime) {
                let obj = {
                    "firstName": result.parsedBody.firstName,
                    "lastName": result.parsedBody.lastName,
                    "email": result.parsedBody.email,
                    "userId": result.parsedBody.userId,
                    "iat": currentTime,
                    "exp": currentTime + expiresIn,
                }
                var response = await helper.createJwtToken(obj);
                return response;
            } else {
                let obj = {
                    "status": 2,
                    "message": "The access token has been expired",
                }
                return obj;
            }
        } else {
            let obj = {
                "status": 0,
                "message": "Invalid token",
            }
            return obj;
        }
    }
    catch (error) {
        return error;
    }
}
