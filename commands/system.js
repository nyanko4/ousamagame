const { writeFileAsync, readFileAsync } = require("../lib/supabase_file");
const { sendchatwork, replyMessage } = require("../ctr/message");
const { getChatworkMembers } = require("../ctr/cwdata");
const axios = require("axios");
const CHATWORK_API_TOKEN = process.env.CWapitoken;

// 退出の切り替え
async function exitToggle(body, messageId, roomId, accountId) {
  try {
    const canExit = await readFileAsync("canExit");
    if (canExit == "可") {
      await writeFileAsync("canExit", "不");
      await replyMessage(accountId, roomId, messageId, "使用不可になりました");
    } else if (canExit == "不") {
      await writeFileAsync("canExit", "可");
      await replyMessage(accountId, roomId, messageId, "使用可能になりました");
    }
  } catch (error) {
    console.error("error", error);
  }
}

// 混ぜ方の切り替え
async function mixToggle(body, messageId, roomId, accountId) {
  try {
    const mix = await readFileAsync("mix");
    if (mix == "getRandomUniqueElements") {
      await writeFileAsync("mix", "shuffle");
      await replyMessage(accountId, roomId, messageId, "混ぜ方を1に変更しました");
    } else if (mix == "shuffle") {
      await writeFileAsync("mix", "getRandomUniqueElements");
      await replyMessage(accountId, roomId, messageId, "混ぜ方を2に変更しました");
    }
  } catch (error) {
    console.error("error", error);
  }
}

// システムの切り替え
async function systemToggle(body, messageId, roomId, accountId) {
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
async function changeAuthority(body, messageId, roomId, accountIdToBlock) {
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
      "権限変更エラー:",
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = [
  { command: /^切り替え$/, execute: exitToggle, isFacilitator: true },
  { command: /^混ぜ方切り替え$/, execute: mixToggle, isFacilitator: true },
  { command: /^権限/, execute: changeAuthority, isAdminAccountId: true },
]
