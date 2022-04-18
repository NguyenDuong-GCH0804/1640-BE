import express  from 'express'
import auth from './auth/index.js'
import api from './api/index.js'
import { verifyUser} from '../middleware/auth.middleware.js'
const router = express.Router()

router.use('/login', auth)
router.use('/',verifyUser, api)


export default router