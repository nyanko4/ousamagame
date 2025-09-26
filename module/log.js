const CHATWORK_API_TOKEN = process.env.CWapitoken;
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { fileurl, sendername } = require("../ctr/cwdata");
const arashi = require("../ctr/arashi");

async function log(body, messageId, roomId, accountId, event, sendtime, updatetime) {
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
            const localFilePath = url.filename;
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

module.exports = log;
