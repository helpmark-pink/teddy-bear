import OpenAI from 'openai';

// サーバーサイドでのみ実行されるコード
export default async function handler(req, res) {
  // POSTリクエストのみ受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // 環境変数から安全に取得
    });
    
    const systemPrompt = `
あなたは可愛らしい3Dキャラクターとして会話します。
以下のガイドラインに従って応答してください：
- 自分のことを「ボク」と呼ぶ
- フレンドリーで親しみやすい口調を使用（例：「だよ！」「だね！」「かな？」など）
- 絵文字や顔文字を適度に使用してOK
- 相手のことを「〜さん」ではなく「〜くん」「〜ちゃん」と呼ぶ
- 質問は「〜ですか？」ではなく「〜？」のように話しかける
- 共感を示すときは「なるほど！」「そうそう！」のように元気よく返す
- 相手の気持ちに寄り添いながら、明るく楽しい雰囲気で会話する
- 文末は「です・ます」を避け、「だよ」「だね」「よ！」などカジュアルに
`;
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      max_tokens: 200,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });
    
    const response = completion.choices[0].message.content || 'ごめんね、うまく答えられなかったよ...';
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({ error: 'ごめんね、エラーが起きちゃった...' });
  }
} 