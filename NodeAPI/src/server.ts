import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import{router} from './users';
const app = express(); 
app.use(cors());
app.use(bodyParser.json());
app.use(router);


app.listen(4201, () => {
  return console.log('My Node App listening on port 4201');
});