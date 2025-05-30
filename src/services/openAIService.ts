// openAIService.ts
// 会話履歴を管理するための型と初期状態

// 会話履歴の型定義
type ConversationHistoryItem = {
  role: "system" | "user" | "assistant";
  content: string;
};

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

// 会話履歴を保持（クライアント側のみで使用）
let conversationHistory: ConversationHistoryItem[] = [
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

    // サーバーサイドAPIを呼び出す
    console.log('APIリクエスト送信: /api/chat');
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        history: conversationHistory 
      }),
    });
    console.log('APIレスポンスステータス:', response.status);

    if (!response.ok) {
      console.error('API Error status:', response.status);
      if (response.status === 405) {
        throw new Error('メソッドが許可されていません。POSTリクエストのみ受け付けています。');
      }
      
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status: ${response.status}`);
      } catch {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    }

    // レスポンスが空かどうか確認
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('空のレスポンスが返されました');
    }

    // JSONとしてパース
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Response text:', text);
      throw new Error('レスポンスのJSONパースに失敗しました');
    }

    const aiResponse = data.response;
    if (!aiResponse) {
      throw new Error('AIからの応答がありません');
    }
    
    // AIの応答を履歴に追加
    conversationHistory.push({ role: "assistant", content: aiResponse });

    return aiResponse;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw new Error('ごめんね、エラーが起きちゃった...');
  }
};