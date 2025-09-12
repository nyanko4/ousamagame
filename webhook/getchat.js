const CHATWORK_API_TOKEN = process.env.CWapitoken;
const fs = require("fs");
const { readFileAsync } = require("../lib/supabase_file");
const axios = require("axios");
const FormData = require("form-data");
const reqcheck = require("../middleware/sign");
const ousama = require("../module/ousamagame");
const dice = require("../module/dice");
const { fileurl, sendername } = require("../ctr/cwdata");
const { readmessage, deleteMessages, deleteMessages2 } = require("../ctr/message");
const arashi = require("../ctr/arashi");
const filePath = "./ousama/ousama.json";
const AdminaccountId = 9487124;


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
  log(body, messageId, roomId, accountId, event, sendtime, updatetime);
  const handlers = [
    ousama,
    dice,
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

async function log(
  body,
  messageId,
  roomId,
  accountId,
  event,
  sendtime,
  updatetime
) {
  try {
    const a = await arashi(body, messageId, roomId, accountId);
    const name = await sendername(accountId, roomId);
    if (a !== "ok") {
      if (body.includes("[info][title][dtext:file_uploaded][/title]")) {
        const url = await fileurl(body, roomId);
        if (url === false) {
          sendchatwork(
            `[qt][qtmeta aid=${accountId} time=${sendtime}]${body}[/qt]`,
            388502383
          );
        } else {
          try {
            const localFilePath = url.filename; // 拡張子をpngに変更
            const writer = fs.createWriteStream(localFilePath);
            const response = await axios({
              method: "get",
              url: url.fileurl,
              responseType: "stream",
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on("finish", resolve);
              writer.on("error", reject);
            });

            const formData = new FormData();
            formData.append("file", fs.createReadStream(localFilePath));
            formData.append("message", name);
            
            const uploadUrl = `https://api.chatwork.com/v2/rooms/388502383/files`;
            const headers = {
              ...formData.getHeaders(),
              "x-chatworktoken": CHATWORK_API_TOKEN,
            };

            const uploadResponse = await axios.post(uploadUrl, formData, {
              headers,
            });

            console.log("ファイルアップロード成功:", uploadResponse.data);

            await new Promise((resolve, reject) => {
              fs.unlink(localFilePath, (err) => {
                if (err) {
                  console.error("ローカルファイルの削除エラー:", err);
                  reject(err); // エラーをreject
                } else {
                  resolve(); // 正常終了
                }
              });
            });

            console.log("ローカルファイルを削除しました。");
          } catch (error) {
            console.error("ファイル送信でエラーが発生しました:", error.message);
            if (error.response) {
              console.error(
                "Chatwork APIエラー:",
                error.response.status,
                error.response.data
              );
            }
          }
        }
      } else {
        if (event === "message_updated") {
          sendchatwork(
            `${name} ${accountId}\n[qt][qtmeta aid=${accountId} time=${updatetime}]${body}[/qt]`,
            388502383
          );
        } else {
          sendchatwork(
            `${name} ${accountId}\n[qt][qtmeta aid=${accountId} time=${sendtime}]${body}[/qt]`,
            388502383
          );
        }
      }
    }
  } catch (error) {
    console.error("error", error);
  }
}

async function sendchatwork(ms, roomId) {
  try {
    await axios.post(
      `https://api.chatwork.com/v2/rooms/${roomId}/messages`,
      new URLSearchParams({ body: ms }),
      {
        headers: {
          "X-ChatWorkToken": CHATWORK_API_TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("メッセージ送信成功");
  } catch (error) {
    console.error(
      "Chatworkへのメッセージ送信エラー:",
      error.response?.data || error.message
    );
  }
}


module.exports = getchat;
