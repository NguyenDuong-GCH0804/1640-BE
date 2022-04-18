import express from 'express';
import { getUser,changePassword, getOne, createOne, updateOne, deleteOne, searchUser } from '../../controller/user/index.js';
import upload from '../../middleware/upload.middleware.js';
const router = express.Router();

router.get('/search', searchUser)
router.put('/changepassword', changePassword)
router.get('/info', getOne)
router.put('/', upload.single('avatar'), updateOne)
router.delete('/', deleteOne)
router.post('/',createOne)
router.get('/', getUser)

export default router