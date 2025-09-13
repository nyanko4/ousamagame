const fs = require("fs");
const path = require("path");
const { sendchatwork, replyMessage } = require("../ctr/message");
const { isUserAdmin } = require("../ctr/cwdata");
const { readFileAsync } = require("../lib/supabase_file");
const adminAccountId = process.env.adminAccountId;

async function isFacilitator(accountId) {
  try {
    const data = await readFileAsync("facilitator");
    if (accountId == data.trim() || accountId == adminAccountId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function isParticipants() {
  try {
    const data = await readFileAsync("participant");
    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error("ファイル読み込みエラー:", error);
    return false;
  }
}

async function isAdminAccountId(accountId) {
  return accountId == adminAccountId;
}

const commands = [];
const commandsDir = path.join(__dirname, "../commands");
for (const file of fs.readdirSync(commandsDir)) {
  if (file.endsWith(".js")) {
    const loaded = require(path.join(commandsDir, file));
    if (Array.isArray(loaded)) {
      commands.push(...loaded);
    } else {
      commands.push(loaded);
    }
  }
}

async function ousamagame(body, messageId, roomId, accountId) {
  try {
    const isAdmin = await isUserAdmin(accountId, roomId);
    for (const cmd of commands) {
      if (!body.match(cmd.command)) continue;

      // アドミンか
      if (cmd.isAdminAccountId) {
        const ok = await isAdminAccountId(accountId);
        if (!ok) return console.log("認証に失敗しました");
      }

      // 参加者がいるか
      if (cmd.isParticipants) {
        const ok = await isParticipants();
        if (!ok) return await replyMessage(accountId, roomId, messageId, "参加者がいません");
      }

      // 進行役かどうか
      if (cmd.isFacilitator) {
        const ok = await isFacilitator(accountId);
        if (!ok) return await replyMessage(accountId, roomId, messageId, "進行役にしてもらってください");
      };
      
      // 管理者かどうか
      if (cmd.isAdmin) {
        if (!isAdmin) return await replyMessage(accountId, roomId, messageId, "管理者のみ利用可能です");
      };
      
      return await cmd.execute(body, messageId, roomId, accountId);
    }
  } catch (error) {
    await replyMessage(accountId, roomId, messageId, `エラー${error.message}`);
  }
}

module.exports = ousamagame;
