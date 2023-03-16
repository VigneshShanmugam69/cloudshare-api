module.exports=function(app){
    var authorization=require("../dist/authorization");
    
    // Delete user from IAM
    app.delete('/deleteUser',authorization.deleteUser)

    // Append credentials to ~/.aws/credential
    app.post('/addCredentials',authorization.addProfiles)
}