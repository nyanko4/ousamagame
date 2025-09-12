const { readFileAsync, writeFileAsync } = require("../lib/supabase_file");
const { sendchatwork, replyMessage } = require("../ctr/message");

// 進行役決定
async function facilitator(body, messageId, roomId, accountId) {
  try {
    const facilitator = body.replace(/^進行役決定|\s+/g, "");
    await writeFileAsync("facilitator", facilitator);
    await replyMessage(accountId, roomId, messageId, `進行役を[piconname:${facilitator}]さんに設定しました`,
      roomId
    );
  } catch (error) {
    console.error(error);
  }
}

// 進行役表示
async function facilitatorDisplay(roomId) {
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

module.exports = [
  { command: /^進行役決定\d+$/, execute: facilitator, isAdmin: true },
  { command: /^進行$/, execute: facilitatorDisplay },
];
