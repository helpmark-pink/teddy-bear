import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
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

let conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
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
      temperature: 0.9, // より自然な応答のために少し上げる
      max_tokens: 200,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const response = completion.choices[0].message.content || 'ごめんね、うまく答えられなかったよ...';
    
    // AIの応答を履歴に追加
    conversationHistory.push({ role: "assistant", content: response });

    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('ごめんね、エラーが起きちゃった...');
  }
};