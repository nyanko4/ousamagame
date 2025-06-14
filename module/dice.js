const sendchatwork = require("../ctr/message").sendchatwork;
//サイコロを振る
async function diceroll(body, messageId, roomId, accountId) {
  if (body.includes("/dice/")) {
    const saikoro = [...body.matchAll(/\d+(?=d)/g)].map(
      (saikoro) => saikoro[0]
    );
    const men = [...body.matchAll(/(?<=d)\d+/g)].map((men) => men[0]);
    const number = [];
    for (let s = 0; s < saikoro; s++) {
      number.push(Math.floor(Math.random() * men) + 1);
    }
    if (saikoro <= 100) {
      if (men <= 100) {
        if (men > 0 && saikoro > 0) {
          await sendchatwork(
            `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}] さん\n${number}`,
            roomId
          );
        } else {
          await sendchatwork(
            `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}] さん\nダイスの数と面の数を指定してください`,
            roomId
          );
        }
      }
    }
  }
  // if (body.includes("/dise/")) {sendchatwork(`[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}] さん\n2`,roomId);}
}

module.exports = diceroll;
