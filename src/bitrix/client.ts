import axios from 'axios';
import { config } from '../config/env.js';

export const bitrix = axios.create({
  baseURL: config.bitrixUrl,
  timeout: 8000,
});
