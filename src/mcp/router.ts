import express from 'express';
import { callTool, listTools, ping } from './handlers.js';

export const router = express.Router();

router.get('/ping', ping);
router.get('/list_tools', listTools);
router.post('/call_tool', callTool);
