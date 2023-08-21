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
} = require("../controller/controller");

router.post("/transcation", newtrans);
router.get("/transcation/:id", alltrans);

router.post("/newt", newt);

router.get("/store", defaultScreen);

// router.post("/login", validationSchema(schemas.user.login), login);
// router.post("/verifyOtp", validationSchema(schemas.user.verifyOtp), verifyOTP);

router.post("/register", validationSchema(schemas.user.update), auth, register);

router.post("/luckdraw", auth, submitLuckyDraw);

router.post("/vendor", venderAddTrans);

module.exports = router;
