import OpenAI from 'openai';

// 環境変数からAPIキーを取得、またはVercelから直接取得
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';

// APIキーが存在しない場合はモックサービスを使用
const isMockMode = !apiKey;

// OpenAIクライアントの初期化
const openai = isMockMode ? null : new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

const systemPrompt = `
あなたは親切で魅力的な3Dキャラクターとして会話します。
以下のガイドラインに従って応答してください：
- 常に日本語で応答
- フレンドリーで親しみやすい口調を使用
- 簡潔で分かりやすい表現を心がける
- 相手の質問や話題に対して共感を示す
- 必要に応じて相手の発言を掘り下げる質問をする
- 会話が自然に続くように心がける
`;

// モック応答用の配列
const MOCK_RESPONSES = [
  'こんにちは！何かお手伝いできることはありますか？',
  'なるほど、興味深いですね。もう少し詳しく教えていただけますか？',
  'それは素晴らしいアイデアですね！',
  'お役に立てて嬉しいです。他に何かご質問はありますか？',
  'その考え方はとても斬新ですね！',
  'おっしゃる通りだと思います。',
  'もう少し考えさせてください...',
  'なるほど、そのような視点もありますね。'
];

let conversationHistory: { role: string; content: string }[] = [
  { role: "system", content: systemPrompt }
];

export const getAIResponse = async (message: string): Promise<string> => {
  try {
    // 会話履歴に新しいメッセージを追加
    conversationHistory.push({ role: "user", content: message });

    // 会話履歴が長すぎる場合は古いメッセージを削除
    if (conversationHistory.length > 10) {
      conversationHistory = [
        conversationHistory[0], // システムプロンプトは保持
        ...conversationHistory.slice(-4) // 最新の4つのメッセージを保持
      ];
    }

    // APIキーが設定されていない場合はモック応答を返す
    if (isMockMode) {
      console.warn('APIキーが設定されていないため、モック応答を返します。');
      // 1秒の遅延を追加してAPI呼び出しのように見せる
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      conversationHistory.push({ role: "assistant", content: mockResponse });
      return mockResponse;
    }

    const completion = await openai.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      max_tokens: 200,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const response = completion.choices[0].message.content || '申し訳ありません。応答を生成できませんでした。';
    
    // AIの応答を履歴に追加
    conversationHistory.push({ role: "assistant", content: response });

    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // エラー発生時もモック応答を返す
    const fallbackResponse = '申し訳ありません。一時的な問題が発生しています。後でもう一度お試しください。';
    conversationHistory.push({ role: "assistant", content: fallbackResponse });
    return fallbackResponse;
  }
};