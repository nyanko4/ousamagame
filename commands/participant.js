const _ = require("lodash");
const { readFileAsync, writeFileAsync } = require("../lib/supabase_file");
const { sendchatwork } = require("../ctr/message");
const adminAccountId = process.env.adminAccountId;

// 入力決定
async function participantRegistration(body) {
  const participant = _.uniq(body.replace(/^入力決定|\s+/g, "").split(","));
  await writeFileAsync("participant", participant);
}

// 登録済みの人を表示
async function participantDisplay(roomId) {
  const canExit = await readFileAsync("canExit");
  const mix = await readFileAsync("mix");
  let shuffle = "";
  switch (mix) {
    case "shuffle": shuffle = 1; break;
    case "getRandomUniqueElements": shuffle = 2; break;
    default: shuffle = "error";
  }
  let Id = `[info][title]登録されてる人　${canExit}　${shuffle}[/title]`;
  const data = await readFileAsync("participant");
  Id += data.join(",");
  Id += "[/info]";
  await sendchatwork(Id, roomId);

  let name = `[info][title]登録されてる人　${canExit}　${shuffle}[/title]`;
  name += data.map(d => `[piconname:${d}]`).join("");
  name += "[/info]";
  await sendchatwork(name, roomId);
}

// 追加
async function participantAdd(body, messageId, roomId, accountId) {
  const Id = body.replace("追加", "");
  let participant = await readFileAsync("participant");
  if (participant.includes(Id)) {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n既に追加されています`,
      roomId
    );
  } else {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n[pname:${Id}]さんを追加します`,
      roomId
    );
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
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n[pname:${account}]さんを削除します`,
      roomId
    );
    participant = _.uniq(participant).filter(
      p => p !== account && p !== "," && p !== ""
    );
    await writeFileAsync("participant", participant);
  } else {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n既に削除されています`,
      roomId
    );
  }
}

// clear
async function participantClear(messageId, roomId, accountId) {
  await writeFileAsync("participant", []);
  await sendchatwork(
    `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n全て削除しました`,
    roomId
  );
}

// 参加申請
async function participation(messageId, roomId, accountId) {
  let participant = await readFileAsync("participant");
  if (participant.includes(accountId)) {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nもう参加が受理されています`,
      roomId
    );
  } else {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n参加を受理します`,
      roomId
    );
    participant.push(accountId);
    participant = _.uniq(participant).filter(p => p !== "" && p !== ",");
    await writeFileAsync("participant", participant);
  }
}

// 退出
async function exit(messageId, roomId, accountId) {
  let participant = await readFileAsync("participant");
  const canExit = await readFileAsync("canExit");
  if (canExit === "可" || accountId === adminAccountId) {
    if (participant.includes(accountId)) {
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n退出を受理します`,
        roomId
      );
    } else {
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nもう退出されています`,
        roomId
      );
    }
    participant = _.uniq(participant).filter(p => p != accountId && p !== ",");
    await writeFileAsync("participant", participant);
  } else {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n使用不可です`,
      roomId
    );
  }
}

module.exports = [
  { command: /^入力決定/, execute: participantRegistration, isFacilitator: true },
  { command: /^追加\d+/, execute: participantAdd, isFacilitator: true },
  { command: /^削除\d+/, execute: participantDelete, isFacilitator: true },
  { command: /^済み$/, execute: participantDisplay },
  { command: /^clear$/, execute: participantClear, isFacilitator: true },
  { command: /^参加申請$/, execute: participation },
  { command: /^退出$/, execute: exit }
];
