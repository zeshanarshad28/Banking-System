const express = require("express");
const userController = require("../controllers/userControllers");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/loginWithAuth", authController.loginWithAuth);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// // Protect all routes after this middleware
// router.use(authController.protect);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

// router.use(authController.restrictTo("admin"));

router
  .route("/getAllUsers")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

router.get(
  "/getSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getUser
);
router.patch(
  "/updateSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUser
);
router.delete(
  "/deleteSingleUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);
router.patch("/turnOnAuth", authController.protect, userController.turnOnAuth);
router.patch(
  "/turnOffAuth",
  authController.protect,
  userController.turnOffAuth
);
router.patch(
  "/makeAdmin/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.makeAdmin
);
router.patch(
  "/makeUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.makeUser
);
router.patch(
  "/restrictToTransferMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restrictToTransferMoney
);
router.patch(
  "/allowToTransferMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.allowToTransferMoney
);
router.patch(
  "/restrictToDepositeMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restrictToDepositeMoney
);
router.patch(
  "/allowToDepositeMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.allowToDepositeMoney
);
router.patch(
  "/restrictToWithdrawMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restrictToWithdrawMoney
);
router.patch(
  "/allowToWithdrawMoney/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.allowToWithdrawMoney
);
router.patch(
  "/blockUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.blockUser
);
router.patch(
  "/unblockUser/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.unblockUser
);
router.post(
  "/requestAtmCard",
  authController.protect,
  userController.requestAtmCard
);
router.patch(
  "/issueAtmCard/:reqId",
  authController.protect,
  authController.restrictTo("admin"),

  userController.issueAtmCard
);
router.patch(
  "/addRecipient/:accountNo",
  authController.protect,
  userController.addRecipient
);

module.exports = router;
