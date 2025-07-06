const { writeFileAsync, readFileAsync } = require("../lib/supabase_file"); // 置き換え版のパス
const _ = require("lodash");
const axios = require("axios");
const CHATWORK_API_TOKEN = process.env.CWapitoken;
const { isUserAdmin, getChatworkMembers } = require("../ctr/cwdata");
const { sendchatwork } = require("../ctr/message");
const AdminaccountId = 9487124;
const filePath = "./ousama/ousama.json";


// 混ぜ方
function getShuffleFunction(method) {
  switch (method) {
    case "shuffle":
      return shuffle;
    default:
      return _.shuffle;
  }
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 参加者が居るか
async function hasParticipants(messageId, roomId, accountId) {
  try {
    const data = await readFileAsync("participant");
    if (data.trim() === "") {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("ファイル読み込みエラー:", error);
    return false;
  }
}

// 進行役かどうか
async function Facilitator(messageId, roomId, accountId) {
  try {
    const data = await readFileAsync("facilitator");
    if (accountId == data.trim() || accountId == AdminaccountId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 王様ゲームコマンド
async function ousamagame(body, messageId, roomId, accountId) {
  console.log(accountId)
  //参加者が居るかどうか
  const ishasParticipants = await hasParticipants(messageId, roomId, accountId);
  const ishasParticipantsms = `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n参加者がいません`;
  //進行役かどうか
  const isFacilitator = await Facilitator(messageId, roomId, accountId);
  const isFacilitatorms = `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n進行役にしてもらってください`;
  //accountIdがAdminaccountIdか
  const isAdminaccountId = accountId === AdminaccountId;
  //管理者かどうか
  const isAdmin = await isUserAdmin(accountId, roomId);
  try {
    // 参加者か居て進行役が言っているか
    if (body.match(/^王様ゲーム$/)) {
      if (isFacilitator) {
        if (ishasParticipants) {
          return await ousama(messageId, roomId, accountId);
        } else {
          await sendchatwork(ishasParticipantsms, roomId);
        }
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    if (body.match(/^結果$/)) {
      if (isFacilitator) {
        if (ishasParticipants) {
          return await result(roomId, accountId);
        } else {
          await sendchatwork(ishasParticipantsms, roomId);
        }
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    if (body.match(/^clear$/)) {
      if (isFacilitator) {
        if (ishasParticipants) {
          return await Participant_clear(messageId, roomId, accountId);
        } else {
          await sendchatwork(ishasParticipantsms, roomId);
        }
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }

    // 進行役が言っているか
    //入力決定
    if (body.match(/^入力決定/)) {
      if (isFacilitator) {
        return await Participant_registration(
          body,
          messageId,
          roomId,
          accountId
        );
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    //追加
    if (body.match(/^追加\d+/)) {
      if (isFacilitator) {
        return await Participant_add(body, messageId, roomId, accountId);
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    //削除
    if (body.match(/^削除\d+/)) {
      if (isFacilitator) {
        return await Participant_delete(body, messageId, roomId, accountId);
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    //切り替え
    if (body.match(/^切り替え$/)) {
      if (isFacilitator) {
        return await exitToggle(messageId, roomId, accountId);
      } else {
        await sendchatwork(isFacilitatorms, roomId);
      }
    }
    if (body.match(/^混ぜ方切り替え$/)) {
      if (isFacilitator) {
        return await mixToggle(messageId, roomId, accountId);
      } else {
        await sendchatwork(
          isFacilitatorms,

          roomId
        );
      }
    }

    // 参加者が居るか
    if (body.match(/^済み$/)) {
      if (ishasParticipants) {
        return await Participant_display(roomId);
      } else {
        await sendchatwork(ishasParticipantsms, roomId);
      }
    }

    // 条件無し
    if (body.match(/^参加申請$/)) {
      await Participation(messageId, roomId, accountId);
      return;
    } else if (body.match(/^退出$/)) {
      await exit(messageId, roomId, accountId);
      return;
    } else if (body.match(/^進行$/)) {
      await facilitator_display(roomId);
      return;
    }

    // 管理者が言っているか
    if (body.match(/^進行役決定/)) {
      if (isAdminaccountId || isAdmin) {
        return await facilitator(body, messageId, roomId, accountId);
      } else {
        await sendchatwork(
          `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n管理者のみ利用可能です`,
          roomId
        );
      }
    }

    if (body.match(/^stop切り替え$/)) {
      if (isAdminaccountId) {
        return await systemToggle(roomId);
      }
    } else if (body.match(/^権限/)) {
      if (isAdminaccountId) {
        return await authority(body, roomId, accountId);
      }
    } else if (body.match(/^デバッグ$/)) {
      if (isAdminaccountId) {
        return await debug(body, messageId, roomId, accountId);
      }
    }
  } catch (error) {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nエラー${error}`,
      roomId
    );
  }
}

// 王様ゲームスタート
async function ousama(messageId, roomId, accountId) {
  const result_display = await readFileAsync("result_display");
  const deathmatch = await readFileAsync("deathmatch");
  
  if (result_display == "済") {
    await writeFileAsync("result_display", "未");
  } else if (result_display == "未") {
   await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]\n結果を出し忘れています`,
      roomId
    );
    await result(roomId, accountId);
    return;
  }
  const participant = await readFileAsync("participant");
  const participantAccountIds = participant.split(",");
  const participant_count = participantAccountIds.length
  if (participant_count === 1)
    return await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nゲームを開始するための人数が足りません`, roomId)
  const indices = [];
  for (let i = 0; i < participantAccountIds.length; i++) {
    indices.push(i);
  }
  //await sendchatwork(indices.toString(), roomId); // デバッグ用
  const mix = await readFileAsync("mix");
  const shuffles = getShuffleFunction(mix);
  const shuffledIndices = shuffles(indices);
  const kingAccountId = participantAccountIds[shuffledIndices[0]];
  let otherParticipantsInfo = "";
  for (let i = 1; i < shuffledIndices.length; i++) {
    const participantNumber = i + 1;
    const participantAccountId = participantAccountIds[shuffledIndices[i]];
    otherParticipantsInfo += `${
      participantNumber - 1
    }:[piconname:${participantAccountId}]\n`;
  }
  const message = `王様は[To:${kingAccountId}][pname:${kingAccountId}]さんです。番号は1〜${
    participantAccountIds.length - 1
  }番までです`;
  await sendchatwork(message, roomId);
  await writeFileAsync("kingAccountId", kingAccountId);

  await writeFileAsync("otherParticipantsInfo", otherParticipantsInfo);
}
// 結果
async function result(roomId, accountId) {
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
    sendchatwork(message, roomId);
  } catch (error) {
    console.error("error", error);
  }
}

// accountId登録
async function Participant_registration(body) {
  try {
    const participant = _.uniq(body.replace(/^入力決定|\s+/g, "").split(","));
    console.log(participant); //デバッグ用
    await writeFileAsync("participant", participant.toString());
  } catch (error) {
    console.error("error", error);
  }
}

// 登録済みの人を表示
async function Participant_display(roomId) {
  try {
    const canExit = await readFileAsync("canExit");
    const mix = await readFileAsync("mix");
    let shuffle = "";
    switch (mix) {
      case "shuffle":
        shuffle = 1;
        break;
      case "getRandomUniqueElements":
        shuffle = 2;
        break;
      default:
        shuffle = "error";
    }
    let Id = `[info][title]登録されてる人　${canExit}　${shuffle}[/title]`;
    const data = await readFileAsync("participant");
    Id += data;
    Id += "[/info]";
    await sendchatwork(Id, roomId);

    let name = `[info][title]登録されてる人　${canExit}　${shuffle}[/title][piconname:`;
    name += data.replace(/,/g, "][piconname:");
    name += "][/info]";
    await sendchatwork(name, roomId);
  } catch (error) {
    console.error("error", error);
  }
}

// オールクリア
async function Participant_clear(messageId, roomId, accountId) {
  try {
    await writeFileAsync("participant", "");
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n全て削除しました`,
      roomId
    );
  } catch (error) {
    console.error("error", error);
  }
}

// 追加
async function Participant_add(body, messageId, roomId, accountId) {
  try {
    //if (body.includes(AdminaccountId)) {await sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n風呂入ってきます`,roomId);return;}
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
      participant = participant.split(",");
      participant.push(Id);
      participant = _.uniq(participant).filter(
        (participant) => participant !== "" && participant !== ","
      );
      await writeFileAsync("participant", participant.join(","));
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 削除
async function Participant_delete(body, messageId, roomId, accountId) {
  try {
    const account = body.replace("削除", "");
    let participant = await readFileAsync("participant");
    if (participant.includes(account)) {
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n[pname:${account}]さんを削除します`,
        roomId
      );
      participant = participant.split(",");
      participant = _.uniq(participant).filter(
        (participant) =>
          participant !== account && participant !== "," && participant !== ""
      );
      await writeFileAsync("participant", participant.join(","));
    } else {
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n既に削除されています`,
        roomId
      );
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 参加申請
async function Participation(messageId, roomId, accountId) {
  try {
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
      participant = participant.split(",");
      participant.push(accountId);
      console.log(participant); //デバッグ用
      participant = _.uniq(participant).filter(
        (participant) => participant !== "" && participant !== ","
      );
      await writeFileAsync("participant", participant.join(","));
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 退出
async function exit(messageId, roomId, accountId) {
  try {
    let participant = await readFileAsync("participant");
    const canExit = await readFileAsync("canExit");
    if (canExit === "可" || accountId === AdminaccountId) {
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
      participant = participant.split(",");
      participant = _.uniq(participant).filter(
        (participant) => participant != accountId && participant !== ","
      );
      console.log(participant); //デバッグ用
      await writeFileAsync("participant", participant);
    } else {
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n使用不可です`,
        roomId
      );
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 進行役決定
async function facilitator(body, messageId, roomId, accountId) {
  try {
    const facilitator = body.replace(/^進行役決定|\s+/g, "");
    await writeFileAsync("facilitator", facilitator);
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]\n進行役を[piconname:${facilitator}]さんに設定しました`,
      roomId
    );
  } catch (error) {
    console.error(error);
  }
}

// 進行役表示
async function facilitator_display(roomId) {
  try {
    const data = await readFileAsync("facilitator");
    await sendchatwork(
      `[info][title]進行役[/title][piconname:${data}][/info]`,
      roomId
    );
  } catch (error) {
    console.error(error);
  }
}

// 退出の切り替え
async function exitToggle(messageId, roomId, accountId) {
  try {
    const canExit = await readFileAsync("canExit");
    if (canExit == "可") {
      await writeFileAsync("canExit", "不");
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n使用不可になりました`,
        roomId
      );
    } else if (canExit == "不") {
      await writeFileAsync("canExit", "可");
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n使用可能になりました`,
        roomId
      );
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 混ぜ方の切り替え
async function mixToggle(messageId, roomId, accountId) {
  try {
    const mix = await readFileAsync("mix");
    if (mix == "getRandomUniqueElements") {
      await writeFileAsync("mix", "shuffle");
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n混ぜ方を1に変更しました`,
        roomId
      );
    } else if (mix == "shuffle") {
      await writeFileAsync("mix", "getRandomUniqueElements");
      await sendchatwork(
        `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\n混ぜ方を2に変更しました`,
        roomId
      );
    }
  } catch (error) {
    console.error("error", error);
  }
}

// システムの切り替え
async function systemToggle(roomId) {
  try {
    const system = await readFileAsync("system");
    if (system == "起動中") {
      await writeFileAsync("system", "停止中");
      await sendchatwork("システムを停止します", roomId);
    } else {
      await writeFileAsync("system", "起動中");
      await sendchatwork("システムを復旧します", roomId);
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 権限
async function authority(body, roomId, accountIdToBlock) {
  try {
    const members = await getChatworkMembers(roomId);

    let adminIds = [];
    let memberIds = [];
    let readonlyIds = [];

    members.forEach((member) => {
      if (member.role === "admin") {
        adminIds.push(member.account_id);
      } else if (member.role === "member") {
        memberIds.push(member.account_id);
      } else if (member.role === "readonly") {
        readonlyIds.push(member.account_id);
      }
    });
    if (body.includes("admin")) {
      adminIds.push(accountIdToBlock);
      readonlyIds = readonlyIds.filter((id) => id !== accountIdToBlock);
      memberIds = memberIds.filter((id) => id !== accountIdToBlock);
    } else if (body.includes("member")) {
      memberIds.push(accountIdToBlock);
      adminIds = adminIds.filter((id) => id !== accountIdToBlock);
      readonlyIds = readonlyIds.filter((id) => id !== accountIdToBlock);
    } else if (body.includes("dis")) {
      readonlyIds.push(accountIdToBlock);
      adminIds = adminIds.filter((id) => id !== accountIdToBlock);
      memberIds = memberIds.filter((id) => id !== accountIdToBlock);
    } else {
      console.log("error");
    }

    const encodedParams = new URLSearchParams();
    encodedParams.set("members_admin_ids", adminIds.join(","));
    encodedParams.set("members_member_ids", memberIds.join(","));
    encodedParams.set("members_readonly_ids", readonlyIds.join(","));

    const url = `https://api.chatwork.com/v2/rooms/${roomId}/members`;
    const response = await axios.put(url, encodedParams.toString(), {
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-chatworktoken": CHATWORK_API_TOKEN,
      },
    });
    return;
  } catch (error) {
    console.error(
      "不正利用フィルターエラー:",
      error.response ? error.response.data : error.message
    );
  }
}

//デバッグ
async function debug(body, messageId, roomId, accountId) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(fileContent);
    await sendchatwork(fileContent, roomId);
    console.log(jsonData);
  } catch (err) {
    console.error(err);
  }
}

module.exports = ousamagame;
