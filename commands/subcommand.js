const { replyMessage } = require("../ctr/message");
//サイコロを振る
async function diceroll(body, messageId, roomId, accountId) {
  
  const saikoro = parseInt((body.match(/\d+(?=d)/) || [])[0], 10);
  const men = parseInt((body.match(/(?<=d)\d+/) || [])[0], 10);

  if (!saikoro || saikoro <= 0 || !men || men <= 0) return await replyMessage(accountId, roomId, messageId, "ダイスの数と面の数を指定してください");;
  
  if (saikoro > 100) return await replyMessage(accountId, roomId, messageId, "ダイスの数を正しく指定してください(1~100)");
  
  if (men > 100) return await replyMessage(accountId, roomId, messageId, "面の数を正しく指定してください(1~100)");
  
  const number = [];
  for (let s = 0; s < saikoro; s++) {
    number.push(Math.floor(Math.random() * men) + 1);
  }
  
    await replyMessage(accountId, roomId, messageId, number.join(","));
}

module.exports = [
  { command: /\/dice\/\d+d\d+/, execute: diceroll },
];
