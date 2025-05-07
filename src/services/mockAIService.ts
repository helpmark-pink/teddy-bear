const JAPANESE_RESPONSES = [
    'はい、どのようなお手伝いができますか？',
    'ご質問承りました。お答えいたしますね。',
    'なるほど、理解いたしました。',
    'もう少し詳しく教えていただけますか？',
    'その件について、詳しくご説明させていただきます。',
    'ご要望を承知いたしました。',
    'お困りの点はございませんか？',
    'それは興味深いお話ですね。',
  ];
  
  export const getAIResponse = async (message: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return JAPANESE_RESPONSES[Math.floor(Math.random() * JAPANESE_RESPONSES.length)];
  };