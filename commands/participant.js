const _ = require("lodash");
const { readFileAsync, writeFileAsync } = require("../lib/supabase_file");
const { sendchatwork, replyMessage } = require("../ctr/message");
const adminAccountId = process.env.adminAccountId;

// 入力決定
async function participantRegistration(body, messageId, roomId, accountId) {
  const participant = _.uniq(body.replace(/^入力決定|\s+/g, "").split(","));
  await writeFileAsync("participant", participant);
}

// 登録済みの人を表示
async function participantDisplay(body, messageId, roomId, accountId) {
  const canExit = await readFileAsync("canExit");
  const mix = await readFileAsync("mix");
  let shuffle = "";
  switch (mix) {
    case "shuffle": shuffle = 1; break;
    case "getRandomUniqueElements": shuffle = 2; break;
    default: shuffle = "error";
  }
  let text = `[info][title]登録されてる人　${canExit}　${shuffle}[/title][info]`;
  const data = await readFileAsync("participant");
  text += data.join(",");
  text += "[/info][info]";
  text += data.map(d => `[piconname:${d}]`).join("");
  text += "[/info][/info]";
  await sendchatwork(text, roomId);
}

// 追加
async function participantAdd(body, messageId, roomId, accountId) {
  const Id = body.replace("追加", "");
  let participant = await readFileAsync("participant");
  if (participant.includes(Id)) {
    await replyMessage(accountId, roomId, messageId, "既に追加されています");
  } else {
    await replyMessage(accountId, roomId, messageId, `[pname:${Id}]さんを追加します`);
    participant.push(Id);
    participant = _.uniq(participant).filter(p => p !== "" && p !== ",");
    await writeFileAsync("participant", participant);
  }
}

// 削除
async function participantDelete(body, messageId, roomId, accountId) {
  const account = body.replace("削除", "");
  let participant = await readFileAsync("participant");
  if (participant.includes(account)) {
    await replyMessage(accountId, roomId, messageId, `[pname:${account}]さんを削除します`);
    participant = _.uniq(participant).filter(
      p => p !== account && p !== "," && p !== ""
    );
    await writeFileAsync("participant", participant);
  } else {
    await replyMessage(accountId, roomId, messageId, `既に削除されています`);
  }
}

// clear
async function participantClear(body, messageId, roomId, accountId) {
  await writeFileAsync("participant", []);
  await replyMessage(accountId, roomId, messageId, "全て削除しました");
}

// 参加申請
async function participation(body, messageId, roomId, accountId) {
  let participant = await readFileAsync("participant") || [];
  if (participant.includes(accountId)) {
    await replyMessage(accountId, roomId, messageId, "もう参加が受理されています");
  } else {
    await replyMessage(accountId, roomId, messageId, "参加を受理します");
    participant.push(accountId);
    participant = _.uniq(participant).filter(p => p !== "" && p !== ",");
    await writeFileAsync("participant", participant);
  }
}

// 退出
async function exit(body, messageId, roomId, accountId) {
  let participant = await readFileAsync("participant");
  const canExit = await readFileAsync("canExit");
  if (canExit === "可" || accountId === adminAccountId) {
    if (participant.includes(accountId)) {
      await replyMessage(accountId, roomId, messageId, "退出を受理します");
    } else {
      await replyMessage(accountId, roomId, messageId, "もう退出されています");
    }
    participant = _.uniq(participant).filter(p => p != accountId && p !== ",");
    await writeFileAsync("participant", participant);
  } else {
    await replyMessage(accountId, roomId, messageId, "使用不可です");
  }
}

module.exports = [
  { command: /^入力決定\S+/, execute: participantRegistration, isFacilitator: true },
  { command: /^追加\d+$/, execute: participantAdd, isFacilitator: true },
  { command: /^削除\d+$/, execute: participantDelete, isFacilitator: true },
  { command: /^済み$/, execute: participantDisplay, isParticipants: true },
  { command: /^clear$/, execute: participantClear, isFacilitator: true },
  { command: /^参加申請$/, execute: participation },
  { command: /^退出$/, execute: exit }
];
