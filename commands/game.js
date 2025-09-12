const { writeFileAsync, readFileAsync } = require("../lib/supabase_file");
const { sendchatwork, replayMessage } = require("../ctr/message");
const { getShuffleFunction } = require("../ctr/gamesystem");

// 開始
async function gameStart(messageId, roomId, accountId) {
  const result_display = await readFileAsync("result_display");
  
  if (!result_display || result_display == "済") {
    await writeFileAsync("result_display", "未");
  } else if (result_display == "未") {
   await replayMessage(accountId, roomId, messageId, "結果を出し忘れています");
    await gameResult(roomId, accountId);
    return;
  }
  
  let participants = await readFileAsync("participant");
  
  if (!participants || participants.length <= 1) return await replayMessage(accountId, roomId, messageId, "ゲームを開始するための人数が足りません")
  
  const indices = Array.from(participants.keys());
  
  //await sendchatwork(indices.toString(), roomId); // デバッグ用
  
  const mix = await readFileAsync("mix");
  const shuffles = getShuffleFunction(mix);
  const shuffledIndices = shuffles(indices);
  const kingAccountId = participants[shuffledIndices[0]];
  let otherParticipantsInfo = "";
  
    otherParticipantsInfo = shuffledIndices
      .slice(1)
      .map((idx, i) => `${i + 1}:[piconname:${participants[idx]}]`)
      .join("\n")
  
  const message = `王様は[To:${kingAccountId}][pname:${kingAccountId}]さんです。番号は1〜${
    participants.length - 1
  }番までです`;

  await writeFileAsync("kingAccountId", kingAccountId);

  await writeFileAsync("otherParticipantsInfo", otherParticipantsInfo);
  
  await sendchatwork(message, roomId);
};

// 結果
async function gameResult(roomId, accountId) {
  try {
    const result_display = await readFileAsync("result_display");
    if (result_display == "未") {
      await writeFileAsync("result_display", "済");
    }
    let message = "[info][title]王様ゲーム[/title]王様は[piconname:";
    message += await readFileAsync("kingAccountId");
    message += "]さん\n";
    message += await readFileAsync("otherParticipantsInfo");
    message += "[/info]";
    await sendchatwork(message, roomId);
  } catch (error) {
    console.error("error", error);
  }
}

module.exports = [
  { command: /^王様ゲーム$/, execute: gameStart, isFacilitator: true, isParticipants: true },
  { command: /^結果$/, execute: gameResult, isFacilitator: true },
];
