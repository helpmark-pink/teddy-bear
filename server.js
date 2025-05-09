import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatHandler from './pages/api/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// APIキーの存在を確認
if (!process.env.OPENAI_API_KEY) {
  console.warn('警告: OPENAI_API_KEYが設定されていません。.envファイルを確認してください。');
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// APIルートのハンドラーを設定
app.all('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 