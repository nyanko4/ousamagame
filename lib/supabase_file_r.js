const supabase = require("../lib/supabase"); // 上記の supabase.js を読み込む

// 書き込み（キーの値を更新）
async function writeFileAsync(keyToUpdate, newValue) {
  try {
    const { error } = await supabase
      .from("game_state_r")
      .update({ [keyToUpdate]: newValue.toString() })
      .eq("id", "ousama");

    if (error) {
      console.error(`更新エラー: ${keyToUpdate}`, error);
    } else {
      console.log(`Supabase: "${keyToUpdate}" を "${newValue}" に更新しました`);
    }
  } catch (err) {
    console.error("Supabase書き込みエラー:", err);
  }
}

// 読み込み（指定キーの値を取得）
async function readFileAsync(key) {
  try {
    const { data, error } = await supabase
      .from("game_state_r")
      .select(key)
      .eq("id", "ousama")
      .single();

    if (error) {
      console.error(`読み込みエラー: ${key}`, error);
      throw error;
    }

    return data[key];
  } catch (err) {
    console.error("Supabase読み込み失敗:", err);
    throw err;
  }
}

module.exports = {
  writeFileAsync,
  readFileAsync,
};
