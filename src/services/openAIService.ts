import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
    throw new Error('AI応答の取得中にエラーが発生しました。');
  }
};