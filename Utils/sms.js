const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

function message(messageBody, to) {
  client.messages
    .create({
      body: messageBody,
      from: "+17572804619",
      //   to: "+923056320218",
      to,
    })
    // .then((message) => console.log(message.sid))
    .then(console.log(`message sent.`))
    .catch((error) => console.log(error));
}
module.exports = { message };
