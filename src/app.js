import  express  from 'express'
import db from './config/db.js'
import router from './routes/index.js';
import cors from 'cors';
import 'dotenv/config'

const app = express();

app.use(cors());
app.use(express.json());
app.use('/public',express.static('public'))
app.use(express.urlencoded({ extended: true }));
const run = async () => {
    await db.connect();
    app.use('/', router)
}
run();
app.listen(process.env.PORT, ()=> console.log('Server is running !'))
export default app