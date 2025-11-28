import express from 'express';
import { callTool, listTools, ping } from './handlers.js';

export const router = express.Router();

router.get('/list_tools', listTools);
router.post('/call_tool', callTool);
router.get('/ping', ping);
