const m = [
  ":D",
  "8-)",
  ":o",
  ";)",
  ";(",
  "(sweat)",
  ":|",
  ":*",
  ":p",
  "(blush)",
  ":^)",
  "|-)",
  "(inlove)",
  "]:)",
  "(talk)",
  "(yawn)",
  "(puke)",
  "(emo)",
  "8-|",
  ":#)",
  "(nod)",
  "(shake)",
  "(^^;)",
  "(whew)",
  "(clap)",
  "(bow)",
  "(roger)",
  "(flex)",
  "(dance)",
  "(:/)",
  "(gogo)",
  "(think)",
  "(please)",
  "(quick)",
  "(anger)",
  "(devil)",
  "(lightbulb)",
  "(*)",
  "(h)",
  "(F)",
  "(cracker)",
  "(eat)",
  "(^)",
  "(coffee)",
  "(beer)",
  "(handshake)",
  "(y)",
  ")",
];
const zzalgo =
  /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/;

//荒らしに対して反応します
async function arashi(body, messageId, roomId, accountId) {
  let count = 0;
  const bodyChars = [...body];

  bodyChars.forEach((char) => {
    if (m.includes(char)) {
      count++;
    }
  });
  if (count >= 20) {
    return "ok";
  }
 
  if ((body.match(/\[To:\d+\]/g) || []).length >= 20) {
    return "ok";
  }
  if ((body.match(/\[p\D+\d+\]/g) || []).length >= 20) {
    return "ok";
  }
  if ((body.match(/\[hr\]/g) || []).length >= 35) {
    return "ok";
  }

  if ((body.match(/\[preview/g) || []).length >= 5) {
    return "ok";
  }
  let zalgoCount = 0;

  for (let char of body) {
    if (zzalgo.test(char)) {
      zalgoCount++;
    }
  }
  if (zalgoCount >= 500) {
    return "ok";
  }
  return "ng";
}
module.exports = arashi
