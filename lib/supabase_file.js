const supabase = require("../lib/supabase");

async function writeFileAsync(keyToUpdate, newValue) {
  try {
    const { error } = await supabase
      .from("gameState")
      .update({ [keyToUpdate]: newValue })
      .eq("id", "ousama");

    if (error) {
      console.error(`更新エラー: ${keyToUpdate}`, error.message, error.details, error.hint);
    } else {
      console.log(`Supabase: "${keyToUpdate}" を "${newValue}" に更新しました`);
    }
  } catch (err) {
    console.error("Supabase書き込みエラー:", err);
  }
}

async function readFileAsync(key) {
  try {
    const { data, error } = await supabase
      .from("game_state")
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
