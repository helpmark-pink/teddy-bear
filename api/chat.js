import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエストのみ受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are accepted.' });
  }
  
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // APIキーが設定されているか確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API Key is not set');
      return res.status(500).json({ error: 'OpenAI APIキーが設定されていません。環境変数を確認してください。' });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
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

    // 会話履歴を使用してメッセージを構築
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(1), // システムプロンプトを除外
      { role: "user", content: message }
    ];
    
    const completion = await openai.chat.completions.create({
      messages,
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
    
    // エラーメッセージをより具体的に
    let errorMessage = 'ごめんね、エラーが起きちゃった...';
    if (error.response?.status === 429) {
      errorMessage = 'ごめんね、APIの制限に達しちゃったみたい...少し待ってからまた話しかけてね！';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'ごめんね、ネットワークに問題があるみたい...接続を確認してね！';
    }
    
    return res.status(500).json({ error: errorMessage });
  }
} 