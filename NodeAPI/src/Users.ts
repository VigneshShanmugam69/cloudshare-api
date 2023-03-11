import {Request,Response,Router} from 'express';
import{connect}from './dbconnection';

export const router: Router = Router();

router.get('/getUser',async (req:Request,res:Response) => {
    try
    {
        const values = await connect();
        const allUsers = await values.query('select * from newdb.users');
        return res.status(200).json(allUsers[0]);
        
    }
    catch (error) 
    {
        console.error(error);
        res.status(500).send(error);
    }
});

router.get('/getRole',async (req:Request,res:Response) => {
    try
    {
        const values = await connect();
        const allRoles = await values.query('select * from role');
        res.status(200).json(allRoles[0]);
    }
    catch (error) 
    {
        console.error(error);
        res.status(500).send(error);
    }
});
router.post('/verifyUser',async (req:Request,res:Response) => {
    try
    {
        const payload = req.body;
        const name = payload['Name'];
        const password = payload.Password;
        const roleID = payload.RoleID;
        const values = await connect();
        const user = await values.query('select users.*,role.Role from users inner join role on role.ID = users.RoleID where users.Name = ? and users.Password = ? and users.RoleID = ?',[name,password,roleID]);
        
        // array of array of user 
        let userDetails = user[0][0];
        //console.log("newValue====>>  ",userDetails);   -- This is for reference while doing console log

        if (userDetails) 
        {
            let obj = {
                "status": 200,
                "IsVerified": true,
                "message": "User verified successfully",
                "result": userDetails
            };
            res.send(obj);
        }
        else
        {
            let obj = {
                "status": 404,
                "IsVerified": false,
                "message": "User not found",
                "result": 0
            };
            res.send(obj);
        }
        
    }
    catch (error) 
    {
        console.log(error);
        res.status(500).send(error);
    }
});