const jwt = require('jsonwebtoken');
const secret_key = 'aBysocqGB1JVl4xaZwnrjw=='; // CloudShare

module.exports.createJwtToken = function(payload) {
    if (payload) {
        try{
            var token = jwt.sign(payload, secret_key);
            let obj = {
                "status": 1,
                "message": "Logged in successfully",
                "token": token
            }
            return obj;
        }catch(error)
        {
            return error;
        }
    }
    else {
        let obj = {
            "status": 2,
            "message": "Invalid access token",
            "token": null
        }
        return obj;
    }
  }


  module.exports.verifyJwtToken = function(req, res, next) {
    const bearer = req.headers.token.split(' ')[0];
    const authToken = req.headers.token.split(' ')[1];
    if (bearer == "Bearer") {
        jwt.verify(authToken, secret_key, (err, decodedToken) => {
            if (err) {
                res.status(401).send(err.message);
            }
            else {
                //req.user = decodedToken;
                next();
            }
        });
    }
    else {
        res.send("Invalid token");
    }
}

