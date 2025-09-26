const CHATWORK_API_TOKEN = process.env.CWapitoken;
const { readFileAsync } = require("../lib/supabase_file");
const reqcheck = require("../middleware/sign");
const ousama = require("../module/ousamagame");
const { deleteMessages } = require("../ctr/message");
const log = require("../module/log");
const adminAccountId = process.env.adminAccountId;

async function getchat(req, res) {
  const c = await reqcheck(req);
  console.log(req.body);
  if (c !== "ok") {
    return res.sendStatus(400);
  }
  const event = req.body.webhook_event_type;
  const {
    body,
    account_id: accountId,
    room_id: roomId,
    message_id: messageId,
    send_time: sendtime,
    update_time: updatetime,
  } = req.body.webhook_event;
  if (accountId == 10153212) {
    if (body.includes("[dtext:chatroom_chat_edited]")) {
      await deleteMessages(body, messageId, roomId, accountId);
    }
    return
  }
  await log(body, messageId, roomId, accountId, event, sendtime, updatetime);
  const handlers = [
    ousama,
  ];
  const system = await readFileAsync("system");
  if (system == "起動中") {
    for (const handler of handlers) {
      if ((await handler(body, messageId, roomId, accountId)) === "ok") {
        return res.sendStatus(200);
      }
    }
  } else if (body.match(/^stop切り替え$/ && accountId === adminAccountId)) {
    return await ousama(body, messageId, roomId, accountId);
  }

  res.sendStatus(200);
}

module.exports = getchat;
