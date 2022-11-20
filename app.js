const imaps = require("imap-simple");
const fs = require("fs");
const config = require('./config')
const mainFunc = require('./rename')

const fileWrite = async (path, content) => {
  fs.writeFile(`./files/${path}`, content, (error) => {
    if (error) {
      console.log(error);
    }
  });
};

imaps.connect(config).then(function (connection) {
  connection
    .openBox("INBOX")
    .then(function () {
      // Fetch emails from the last 24h
      const delay = 24 * 3600 * 1000;
      let yesterday = new Date();
      yesterday.setTime(Date.now() - delay);
      yesterday = yesterday.toISOString();
      const searchCriteria = ["UNSEEN", ["SINCE", yesterday]];
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"],
        struct: true,
        markSeen: false,
      };

      // retrieve only the headers of the messages
      return connection.search(searchCriteria, fetchOptions);
    })
    .then(function (messages) {
      let attachments = [];

      messages.forEach(function (message) {
        const parts = imaps.getParts(message.attributes.struct);
        attachments = attachments.concat(
          parts
            .filter(function (part) {
              return (
                part.disposition &&
                part.disposition.type.toUpperCase() === "ATTACHMENT"
              );
            })
            .map(function (part) {
              // retrieve the attachments only of the messages with attachments
              return connection
                .getPartData(message, part)
                .then(function (partData) {
                  return {
                    filename: part.disposition.params.filename,
                    data: fileWrite(part.disposition.params.filename, partData),
                  };
                });
            })
        );
      });

      return Promise.all(attachments);
    })
    .then(async function (attachments) {
      console.log(attachments)
      await mainFunc()
    });
});