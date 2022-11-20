require("dotenv").config();

const config = {
  imap: {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

module.exports = config;
