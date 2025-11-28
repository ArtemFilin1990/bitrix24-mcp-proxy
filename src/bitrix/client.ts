import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const bitrix = axios.create({
  baseURL: process.env.BITRIX_WEBHOOK_URL,
  timeout: 7000
});
