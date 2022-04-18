import express from 'express';
import {login} from '../../controller/auth/auth.controller.js';

const router = express.Router();

router.post('/', login)


export default router