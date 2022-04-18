import express from 'express'
import user from './user.routes.js'
import category from './category.routes.js'
import idea from './idea.routes.js'
import time from './time.routes.js'
import comment from './comment.routes.js'
import {isAdmin, isManager} from '../../middleware/auth.middleware.js'
const router = express.Router();

router.use('/comment',comment)
router.use('/time',isManager, time)
router.use('/idea', idea )
router.use('/user',isAdmin, user)
router.use('/category',isManager, category)

export default router
