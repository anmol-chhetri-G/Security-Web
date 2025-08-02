import express from 'express';
import { scanUsername, getIpInfo, getDomainInfo } from '../controllers/index.js';

const router = express.Router();

router.post('/scan-username', scanUsername);
router.post('/ip-info', getIpInfo);
router.post('/domain-info', getDomainInfo);

export default router;