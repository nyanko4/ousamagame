const { readmessage, deleteMessages2 } = require("../ctr/message");
const adminAccountId = process.env.adminAccountId;

async function mention(req, res) {
  const accountId = req.body.webhook_event.from_account_id;
  const roomId = req.body.webhook_event.room_id;
  const messageId = req.body.webhook_event.message_id;
  const body = req.body.webhook_event.body;
  await readmessage(roomId, messageId);
  if(body.includes("/削除/") && accountId == adminAccountId) return deleteMessages2(body, messageId, roomId, accountId);
}

module.exports = mention;
