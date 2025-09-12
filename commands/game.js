const { writeFileAsync, readFileAsync } = require("../lib/supabase_file");
const CHATWORK_API_TOKEN = process.env.CWapitoken;
const { sendchatwork } = require("../ctr/message");
const { getShuffleFunction } = require("../ctr/gamesystem");
const _ = require("lodash");

// 開始
async function gameStart(messageId, roomId, accountId) {
  const result_display = await readFileAsync("result_display");
  
  if (!result_display || result_display == "済") {
    await writeFileAsync("result_display", "未");
  } else if (result_display == "未") {
   await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]\n結果を出し忘れています`,
      roomId
    );
    await gameResult(roomId, accountId);
    return;
  }
  let participants = await readFileAsync("participant");
  if (participants.length <= 1)
    return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nゲームを開始するための人数が足りません`, roomId)
  const indices = [];
  for (let i = 0; i < participants.length; i++) {
    indices.push(i);
  }
  //await sendchatwork(indices.toString(), roomId); // デバッグ用
  const mix = await readFileAsync("mix");
  const shuffles = getShuffleFunction(mix);
  const shuffledIndices = shuffles(indices);
  const kingAccountId = participants[shuffledIndices[0]];
  let otherParticipantsInfo = "";
  for (let i = 1; i < shuffledIndices.length; i++) {
    const participantNumber = i + 1;
    const participantAccountId = participants[shuffledIndices[i]];
    otherParticipantsInfo += `${
      participantNumber - 1
    }:[piconname:${participantAccountId}]\n`;
  }
  const message = `王様は[To:${kingAccountId}][pname:${kingAccountId}]さんです。番号は1〜${
    participants.length - 1
  }番までです`;
  await sendchatwork(message, roomId);
  await writeFileAsync("kingAccountId", kingAccountId);

  await writeFileAsync("otherParticipantsInfo", otherParticipantsInfo);
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
