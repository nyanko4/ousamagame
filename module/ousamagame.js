const fs = require("fs");
const path = require("path");
const { sendchatwork } = require("../ctr/message");

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
    for (const cmd of commands) {
      if (body.match(cmd.command)) {
        return await cmd.execute(body, messageId, roomId, accountId);
      }
    }
  } catch (error) {
    await sendchatwork(
      `[rp aid=${accountId} to=${roomId}-${messageId}][pname:${accountId}]さん\nエラー${error.message}`,
      roomId
    );
  }
}

module.exports = ousamagame;
