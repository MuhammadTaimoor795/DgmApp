require("dotenv").config();
const models = require("../../models/index");

const Sequelize = require("sequelize");
const { errorResponse, success } = require("../utils/constants");
const Op = Sequelize.Op;
const crypto = require("crypto");
const { ApiError } = require("../utils/error");
const generateAccessToken = require("../middleware/accessToken");
const sdk = require("api")("@doubletick/v2.0#leuafj3htll6tmgcx");
const path = require("path");
const qr = require("qrcode");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const staticKey = Buffer.from(
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
);

// Static IV (Initialization Vector)
const staticIV = Buffer.from("0123456789abcdef0123456789abcdef", "hex");

module.exports = {
  newtrans: async (req, res, next) => {
    try {
      let { price, user, store } = req.body;

      let dbuser = await models.User.findOne({
        where: {
          name: user,
        },
      });
      let newtransaction = await models.Transaction.create({
        price,
        store,
        UserId: dbuser.id,
      });
      if (newtransaction) {
        console.log("price", price);
        let findoffers = await models.Offer.findAll({
          where: {
            limit: price,
          },
        });
        console.log("offers", findoffers);

        if (findoffers.length > 0) {
          console.log("yes offer exist");
          for (let item of findoffers) {
            await models.TransactionOffer.create({
              status: true,
              TransactionId: newtransaction.id,
              OfferId: item.id,
            });
          }
        } else {
          console.log("NO offers");
        }
      }
      return res.json({
        message: "New Transction Added ",
        transcationid: newtransaction.id,
      });
    } catch (error) {
      console.log("server error", error.message);
      next(error);
    }
  },
  alltrans: async (req, res, next) => {
    try {
      let id = req.params.id;
      let transcation = await models.Transaction.findOne({
        where: {
          id,
        },
        include: [
          {
            model: models.TransactionOffer,
            include: [
              {
                model: models.Offer,
              },
            ],
          },
        ],
      });

      let offers = [];
      for (let item of transcation.TransactionOffers) {
        let oneoffer = {
          id: item.Offer.id,
          store_Name: item.Offer.name,
          discount: item.Offer.discount,
          limit: item.Offer.limit,
        };
        offers.push(oneoffer);
      }
      let obj = {
        TransactionId: transcation.id,
        offers,
      };
      return res.json({
        offers: obj,
      });
    } catch (error) {
      console.log("server error", error.message);
      next(error);
    }
  },

  newt: async (req, res, next) => {
    try {
      let { unique_id, generated_at_store, invoice_id, invoice_amount } =
        req.body;

      let alloffer = await models.Offer.findAll();

      let useroffer = [];

      for (let offer of alloffer) {
        console.log("offer.target_store", offer.target_store);

        console.log("generated_at_store", generated_at_store);
        console.log("offer.target_price", offer.target_price);
        console.log("invoice_amount", invoice_amount);

        if (
          offer.target_store == generated_at_store &&
          offer.target_price <= invoice_amount
        ) {
          useroffer.push(offer.id);
        } else {
          // console.log("offer.target_store",offer.target_store)
        }
      }

      console.log("offer", useroffer);
      let usercupons = [];
      for (let uf of useroffer) {
        let cu = await models.Coupon.create({
          generated_at_store,
          OfferId: uf,
        });
        if (cu) {
          usercupons.push(cu.cup_id);
        }
      }
      console.log("usercupons", usercupons);

      let userdata = await models.storePurchase.create({
        generated_at_store,
        invoice_id,
        invoice_amount,
        offers: usercupons,
      });

      return res.json({
        offers: userdata,
      });
    } catch (error) {
      console.log("server error", error.message);
      next(error);
    }
  },

  defaultScreen: async (req, res, next) => {
    try {
      let { date, all } = req.query;

      console.table(typeof all);

      const currentDate = new Date().toISOString();
      console.log("cuttent", currentDate);

      let data = {};
      data.fetchdate = currentDate;
      if (all === "true") {
        let stores = await models.Store.findAll({
          include: [
            {
              model: models.StoreAttributes,
            },
          ],
        });

        const transformedArray = stores.map((store) => {
          const transformedStore = {
            storeid: store.id,
            name: store.name,
          };

          store.StoreAttributes.forEach((attr) => {
            transformedStore[attr.name] = attr.value;
          });

          return transformedStore;
        });
        transformedArray.forEach((store) => {
          if (store.rank) {
            store.rank = parseInt(store.rank, 10);
          }
        });

        // Sort the array by rank
        transformedArray.sort((a, b) => {
          if (a.rank && b.rank) {
            return a.rank - b.rank;
          } else if (a.rank) {
            return -1; // a has rank, b doesn't
          } else if (b.rank) {
            return 1; // b has rank, a doesn't
          } else {
            return 0; // both a and b don't have rank
          }
        });

        data.stores = transformedArray;

        // feeds
        let posts = await models.Post.findAll({});
        posts.sort((a, b) => {
          if (a.rank && b.rank) {
            return a.rank - b.rank;
          } else if (a.rank) {
            return -1; // a has rank, b doesn't
          } else if (b.rank) {
            return 1; // b has rank, a doesn't
          } else {
            return 0; // both a and b don't have rank
          }
        });

        data.post = posts;
        return res.status(200).json(success(data, res.statusCode));
      }
      if (all === "false") {
        console.log("in false");
        let changedata = await models.Store.findAll({
          include: [
            {
              model: models.StoreAttributes,
              where: {
                updatedAt: { [Sequelize.Op.gte]: date }, // Fetch records updated after the last request
              },
            },
          ],
        });
        const transformedArray = changedata.map((store) => {
          const transformedStore = {
            storeid: store.id,
            name: store.name,
          };

          store.StoreAttributes.forEach((attr) => {
            transformedStore[attr.name] = attr.value;
          });

          return transformedStore;
        });
        transformedArray.forEach((store) => {
          if (store.rank) {
            store.rank = parseInt(store.rank, 10);
          }
        });

        // Sort the array by rank
        transformedArray.sort((a, b) => {
          if (a.rank && b.rank) {
            return a.rank - b.rank;
          } else if (a.rank) {
            return -1; // a has rank, b doesn't
          } else if (b.rank) {
            return 1; // b has rank, a doesn't
          } else {
            return 0; // both a and b don't have rank
          }
        });

        data.stores = transformedArray;

        //change posts
        let changepost = await models.Post.findAll({
          where: {
            updatedAt: { [Sequelize.Op.gte]: date }, // Fetch records updated after the last request
          },
        });

        data.Post = changepost;
        return res.status(200).json(success(data, res.statusCode));
      } else {
        return res
          .status(422)
          .json(
            errorResponse(
              "all must be true or false and date must be valid format 2023-08-17 15:41:59.804+05",
              422
            )
          );
      }
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },
  submitLuckyDraw: async (req, res, next) => {
    try {
      let userid = req.user.id;
      let { coupon } = req.body;

      // Function to encrypt text

      // Example usage
      // const originalText = "Hello, this is a secret message";

      //Encrypt the text
      // const encryptedText = encryptText(originalText);
      // console.log("Encrypted Text:", encryptedText);

      // let encryptedText =
      //   "cfa0aedb92ec290a6a796bcf24bbf4d1bcb840c076d5473645fda0ba9158fa27";
      // Decrypt the text

      const decryptCoupon = decryptText(coupon);
      console.log("co", decryptCoupon);
      // split
      let transcationid = decryptCoupon.split("_")[0];
      let invoice = decryptCoupon.split("_")[1];
      console.table({ transcationid, invoice });

      let vendertransaction = await models.VendorTransaction.findOne({
        where: {
          id: parseInt(transcationid),
          invoice,
        },
      });
      if (!vendertransaction) {
        throw new ApiError("Invalid Coupen", { status: 400 });
      }

      // yes exist
      let updateTranscation = await models.VendorTransaction.update(
        {
          UserId: userid,
          codeSubmission: new Date().toISOString(),
        },
        {
          where: {
            id: vendertransaction.id,
          },
        }
      );

      if (updateTranscation[0] === 1) {
        return res
          .status(200)
          .json(success("LuckyDraw Successfully Added", res.statusCode));
      }
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },
  login: async (req, res, next) => {
    try {
      let { phone, type } = req.body;

      // find user

      let user = await models.User.findOne({
        where: {
          ph: phone,
        },
      });

      const content = {};
      const otp = generateOTP();
      if (!user) {
        let newuser = await models.User.create({
          ph: phone,
          type,
          otp,
        });

        content.text = `Your Account Registration OTP is ${otp}`;
      } else {
        content.text = `Your Account Login OTP is ${otp}`;
        let updateuser = await models.User.update(
          {
            otp,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
      }

      sdk.auth("key_7LsVKlBnJT");
      await sdk.outgoingMessagesWhatsappText({
        content,
        to: phone,
      });
      return res
        .status(200)
        .json(success({ text: content.text }, res.statusCode));
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      let { otp } = req.body;

      // find user

      let user = await models.User.findOne({
        where: {
          otp,
        },
      });

      if (!user) {
        throw new ApiError("Invalid Token ", { status: 400 });
      }

      if (user) {
        const recordWithNullFields = await models.User.findOne({
          where: {
            [Op.and]: [
              { id: user.id },
              {
                [Op.or]: [
                  { email: { [Op.is]: null } },
                  { name: { [Op.is]: null } },
                  { age: { [Op.is]: null } },
                ],
              },
            ],
          },
        });

        let payload = { phone: user.ph, id: user.id };
        let accessToken = generateAccessToken(payload);
        let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
        let output = {
          accessToken,
          refreshToken,
        };
        if (recordWithNullFields) {
          output.register = {
            requried: true,
            message: "User is not registered",
          };
        } else {
          output.register = {
            requried: false,
            message: "User is Registered",
          };
        }

        console.log("user", user.id);
        let updateotp = await models.User.update(
          {
            otp: null,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
        if (updateotp) {
          return res.status(200).json(success(output, res.statusCode));
        }
      }
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },
  register: async (req, res, next) => {
    try {
      let { name, email, age, phone, otp } = req.body;

      // let register = await models.User.create({
      //   name,
      //   email,
      //   age,
      //   ph: phone,
      // });

      // let findOTP = await models.VendorTransaction.findOne({
      //   where: {
      //     otp,
      //   },
      //   include: [
      //     {
      //       model: models.Store,
      //     },
      //   ],
      // });
      // let updateTranscation = await models.VendorTransaction.update(
      //   {
      //     UserId: register.id,
      //     codeSubmission: new Date().toISOString(),
      //     otp: null,
      //   },
      //   {
      //     where: {
      //       id: findOTP.id,
      //     },
      //   }
      // );

      // if (updateTranscation[0] === 1) {
      //   let message = `Thank you ${register.name} for Shopping at ${findOTP.Store.name} for amount ${findOTP.billingAmount} rupees  . 1 Ticket have been successfully Added to your account`;
      //   // return res
      //   //   .status(200)
      //   //   .json(success({ status: 200, message }, res.statusCode));
      //   return res.status(200).json({ status: 200, message });
      // }
      return res.status(200).json({ name, email, age, phone, otp });
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },

  venderAddTrans: async (req, res, next) => {
    try {
      let { invoice, billamount, from } = req.body;

      let findVender = await models.User.findOne({
        where: {
          ph: from,
        },
      });

      console.log("findVender", findVender.id);
      let findVenderStore = await models.Store.findOne({
        where: {
          UserId: findVender.id,
        },
      });

      console.log("findVenderStore", findVenderStore.id);

      console.log("Sraring wgil");
      let otp = generateOTP6digit();
      // while (1) {
      //   opt = generateOTP6digit();
      //   console.log("genereated Oprt", opt);
      //   console.log("finding OTP");

      //   let findotp = await models.VendorTransaction.findOne({
      //     where: {
      //       otp: otp,
      //     },
      //   });

      //   console.log("findotp findotp", findotp);
      //   if (!findotp) {
      //     break;
      //   }
      // }

      let newtrans = await models.VendorTransaction.create({
        invoice,
        billingAmount: billamount,
        StoreId: findVenderStore.id,
        otp,
      });

      if (newtrans) {
        const sdk = require("api")("@doubletick/v2.0#leuafj3htll6tmgcx");

        sdk.auth("key_7LsVKlBnJT");

        let sendOpt = await sdk.outgoingMessagesWhatsappText({
          content: { text: `Generated OTP for User is ${otp}` },
          to: from,
        });

        return res.json({ status: sendOpt.status });
      }
      /// Sending Messae
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },
  // this code is for sending QRcode
  // venderAddTransQR: async (req, res, next) => {
  //   try {
  //     let { invoice, billamount, from } = req.body;

  //     let findVender = await models.User.findOne({
  //       where: {
  //         ph: from,
  //       },
  //     });

  //     console.log("findVender", findVender.id);
  //     let findVenderStore = await models.Store.findOne({
  //       where: {
  //         UserId: findVender.id,
  //       },
  //     });

  //     console.log("findVenderStore", findVenderStore.id);
  //     let newtrans = await models.VendorTransaction.create({
  //       invoice,
  //       billingAmount: billamount,
  //       StoreId: findVenderStore.id,
  //     });

  //     let qrData = `https://wa.me/919100082008?text=This is My Transction details=${newtrans.id}_${newtrans.invoice}`;
  //     const qrOptions = {
  //       width: 200, // Specify the desired width (in pixels)
  //       margin: 0, // Set margin to 0
  //     };

  //     // Generate QR code and save it as an image file
  //     const currentDate = new Date().getTime();
  //     const directoryPath = path.join(__dirname, "../../public/");

  //     // Check if the directory exists
  //     if (!fs.existsSync(directoryPath)) {
  //       // If it doesn't exist, create it
  //       fs.mkdirSync(directoryPath);
  //       console.log(`Directory "${directoryPath}" created.`);
  //     } else {
  //       console.log(`Directory "${directoryPath}" already exists.`);
  //     }

  //     let pth = path.join(__dirname, `../../public/${currentDate}.png`);

  //     const qrImageFilePath = pth;
  //     await qr.toFile(qrImageFilePath, qrData, qrOptions);

  //     let sendfile = `${process.env.HOST}/${currentDate}.png`;
  //     console.log("Send File", sendfile);
  //     /// Sending Messae
  //     const sdk = require("api")("@doubletick/v2.0#leuafj3htll6tmgcx");

  //     sdk.auth("key_7LsVKlBnJT");
  //     let sendimage = await sdk.outgoingMessagesWhatsappImage({
  //       content: {
  //         //mediaUrl: "https://dom-api.ncu.io/public/assets/profileImage.png",
  //         mediaUrl: sendfile,
  //         caption: "Ask your Customer to Scan this QrCode",
  //       },
  //       to: from,
  //     });

  //     return res.json({ status: sendimage.status });
  //   } catch (error) {
  //     if (error.status === undefined) {
  //       error.status = 500;
  //     }
  //     return res
  //       .status(error.status)
  //       .json(errorResponse(error.message, error.status));
  //   }
  // },

  findUser: async (req, res, next) => {
    try {
      let ph = req.params.ph;

      let findUser = await models.User.findOne({
        where: {
          ph,
        },
      });

      if (findUser) {
        return res
          .status(200)
          .json(success({ status: 200, User: findUser.name }, res.statusCode));
      } else {
        return res.status(200).json(success({ status: 404 }, res.statusCode));
      }
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },

  UserLuckyOTP: async (req, res, next) => {
    try {
      let { otp, phone } = req.body;

      // find OTP
      let findOTP = await models.VendorTransaction.findOne({
        where: {
          otp,
        },
        include: [
          {
            model: models.Store,
          },
        ],
      });
      //console.log("fidnopt", findOTP);
      //return res.status(200).json(success(findOTP, res.statusCode));
      if (!findOTP) {
        // return res
        //   .status(200)
        //   .json(
        //     success({ status: 500, message: "Invalid OTP" }, res.statusCode)
        //   );

        return res.status(200).json({ status: 500, message: "Invalid OTP" });
      } else {
        let findUser = await models.User.findOne({
          where: {
            ph: phone,
          },
        });
        if (findUser) {
          let updateTranscation = await models.VendorTransaction.update(
            {
              UserId: findUser.id,
              codeSubmission: new Date().toISOString(),
              otp: null,
            },
            {
              where: {
                id: findOTP.id,
              },
            }
          );

          if (updateTranscation[0] === 1) {
            let message = `Thank you ${findUser.name} for Shopping at ${findOTP.Store.name} for amount ${findOTP.billingAmount} rupees  . 1 Ticket have been successfully Added to your account`;
            // return res
            //   .status(200)
            //   .json(success({ status: 200, message }, res.statusCode));

            return res.status(200).json({ status: 200, message });
          }
        } else {
          let message = `Thank for Shopping at ${findOTP.Store.name} for amount ${findOTP.billingAmount} rupees . Please Help us with few details to setup your account `;
          // return res
          //   .status(200)
          //   .json(success({ status: 404, message }, res.statusCode));

          return res.status(200).json({ status: 404, message });
        }
      }
    } catch (error) {
      if (error.status === undefined) {
        error.status = 500;
      }
      return res
        .status(error.status)
        .json(errorResponse(error.message, error.status));
    }
  },
};

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
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateOTP6digit() {
  const otpLength = 6;
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
}

async function SendMessage(from, message) {
  sdk.auth("key_7LsVKlBnJT");

  let sendMessage = await sdk.outgoingMessagesWhatsappText({
    content: { text: message },
    to: from,
  });
}

// const crypto = require("crypto");

//   const string1 = "TXN0001";
//   const string2 = "inv34224";

//   // Combine the strings
//   const combinedString = string1 + " " + string2;

//   // Generate a random encryption key (32 bytes)
//   const encryptionKey = crypto.randomBytes(32);

//   // Generate a random initialization vector (IV)
//   const iv = crypto.randomBytes(16);

//   // Create a cipher object with AES algorithm and GCM mode
//   const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

//   // Encrypt the combined string
//   let encryptedCouponCode = cipher.update(combinedString, "utf-8", "hex");
//   encryptedCouponCode += cipher.final("hex");

//   // Get the authentication tag
//   const authTag = cipher.getAuthTag();

//   console.log("Encrypted Coupon Code:", encryptedCouponCode);

//   //await sequelize.query("CREATE SEQUENCE store_sequence");

//   // Create a decipher object with the same algorithm and mode
//   const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv);

//   // Set the authentication tag
//   decipher.setAuthTag(authTag);

//   // Decrypt the encrypted coupon code
//   let decryptedCouponCode = decipher.update(
//     encryptedCouponCode,
//     "hex",
//     "utf-8"
//   );
//   decryptedCouponCode += decipher.final("utf-8");

// let payload = { phone: ph, id: user.id };
//         let accessToken = generateAccessToken(payload);
//         let refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
//         return res.status(200).json(
//           success(
//             {
//               accessToken,
//               refreshToken,
//               phonetext: `Your Login OTP is ${otp}`,
//             },
//             res.statusCode
//           )
// );

//u633667574_try1
// u633667574_try1
// Abcd1234@1
