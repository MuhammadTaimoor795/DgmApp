// Dotenv handy for local config & debugging
require("dotenv").config();

// Core Express & logging stuff
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const errorHandler = require("./src/middleware/error-handler");
const { sequelize } = require("./models");
const models = require("./models/index");
const crypto = require("crypto");
const staticKey = Buffer.from(
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
);

// Static IV (Initialization Vector)
const staticIV = Buffer.from("0123456789abcdef0123456789abcdef", "hex");

const app = express();

const path = require("path");

// Logging
app.use(logger("dev"));

//cors
const cors = require("cors");
const helmet = require("helmet");
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  //    next();

  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

//wearing a helmet

app.use(helmet());

// Parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "/public")));

// Routes & controllers
app.get("/api", (req, res) => res.json({ msg: " Testinh Api" })),
  app.use("/api", require("./src/routes/route"));

// app.use("/admin", require("./src/routes/admin"));

// Catch all route, generate an error & forward to error handler
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

// Get values from env vars or defaults where not provided
//let port = process.env.PORT || 80;
let port = 3003;
// Start the server
app.listen(port, async () => {
  console.log(`Server Started on port ${port}`);
  await sequelize.authenticate();
  // console.log(__dirname)
  //await sequelize.sync({ force: true, alter: true });
  //await sequelize.sync({ alter: true });
  console.log("DB connected");

  //await sequelize.query("CREATE SEQUENCE store_sequence");

  try {
    // let up = await models.StoreAttributes.update(
    //   {
    //     value: "KiDX",
    //   },
    //   {
    //     where: {
    //       name: "category",
    //       StoreId: "St0001",
    //     },
    //   }
    // );
    // console.log("up", up);
    // await models.StoreAttributes.update(
    //   {
    //     value: "new Value",
    //   },
    //   {
    //     where: {
    //       name: "stories",
    //       StoreId: "St0011",
    //     },
    //   }
    // );
    // await models.Post.update(
    //   {
    //     imageUrl: "New Image Ulr ",
    //   },
    //   {
    //     where: {
    //       StoreId: "St0011",
    //       caption: "Text #4",
    //     },
    //   }
    // );
    // const sdk = require("api")("@doubletick/v2.0#leuafj3htll6tmgcx");
    // sdk.auth("key_7LsVKlBnJT");
    // sdk
    //   .outgoingMessagesWhatsappText({
    //     content: { text: "hi" },
    //     to: "+918008974581",
    //   })
    //   .then(({ data }) => console.log(data))
    //   .catch((err) => console.error(err));
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = app;

// Function to encrypt text
function encryptText(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", staticKey, staticIV);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Function to decrypt text
function decryptText(encryptedText) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", staticKey, staticIV);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// // Example usage
// const originalText = "1_inv123";

// //Encrypt the text
// const encryptedText = encryptText(originalText);
// console.log("Encrypted Text:", encryptedText);

// // let encryptedText =
// //   "cfa0aedb92ec290a6a796bcf24bbf4d1bcb840c076d5473645fda0ba9158fa27";
// // Decrypt the text
// const decryptedText = decryptText(encryptedText);
// console.log("Decrypted Text:", decryptedText);
