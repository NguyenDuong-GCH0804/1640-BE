import express from 'express';
import{createOne, updateOne, deleteOne} from '../../controller/comment/index.js'
const router = express.Router();

router.post('/', createOne)
router.delete('/', deleteOne)
router.put('/', updateOne)

export default router

