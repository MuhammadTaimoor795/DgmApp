const router = require("express").Router();
const auth = require("../middleware/MiddleWareCon_JWT");
const { validationSchema, schemas } = require("../middleware/joivalidation");
const {
  newtrans,
  alltrans,
  newt,
  defaultScreen,
  submitLuckyDraw,
  login,
  verifyOTP,
  register,
  venderAddTrans,
  findUser,
  UserLuckyOTP,
  newlogin,
  Profile,
} = require("../controller/controller");

// router.post("/transcation", newtrans);
// router.get("/transcation/:id", alltrans);

// router.post("/newt", newt);

router.get("/store", defaultScreen);

// router.post("/login", validationSchema(schemas.user.login), login);
// router.post("/verifyOtp", validationSchema(schemas.user.verifyOtp), verifyOTP);

// router.post("/luckdraw", auth, submitLuckyDraw);

// New One
router.post("/vendor", venderAddTrans);

// router.get("/:phone/:secret", findUser);
router.post("/user/otp", UserLuckyOTP);
router.post("/register", register);
router.post("/login", newlogin);
router.get("/profile/:secret", Profile);

module.exports = router;
