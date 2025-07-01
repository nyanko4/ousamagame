const CHATWORK_API_TOKEN = process.env.CWapitoken;
const { readFileAsync } = require("../lib/supabase_file_r"); // 置き換え版のパス
const axios = require("axios");
const reqcheck = require("../middleware/rsign");
const ousama = require("../module/rousama");
const { fileurl, sendername } = require("../ctr/cwdata");
const { readmessage, deleteMessages, deleteMessages2 } = require("../ctr/message");
const filePath = "./ousama/rousama.json";
const AdminaccountId = 9487124;

async function renbeya(req, res) {
  const c = await reqcheck(req);
  console.log(req.body);
  if (c !== "ok") {
    return res.sendStatus(400);
  }
  const {
    body,
    account_id: accountId,
    room_id: roomId,
    message_id: messageId,
  } = req.body.webhook_event;
  await readmessage(roomId, messageId);
  if (accountId == 10153212) {
    if (body.includes("[dtext:chatroom_chat_edited]")) {
      deleteMessages(body, messageId, roomId, accountId);
    }
    return
  }
  if(body.includes("/削除/") && accountId === AdminaccountId) {
    deleteMessages2(body, messageId, roomId, accountId);
  }
  const handlers = [
    ousama
  ];
  const system = await readFileAsync("system");
  if (system == "起動中") {
    for (const handler of handlers) {
      if ((await handler(body, messageId, roomId, accountId)) === "ok") {
        return res.sendStatus(200);
      }
    }
  } else if (body.match(/^stop切り替え$/)) {
    return await ousama(body, messageId, roomId, accountId);
  }

  res.sendStatus(200);
}

module.exports = renbeya;
