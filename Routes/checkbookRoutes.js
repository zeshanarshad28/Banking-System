const express = require("express");
const checkbookControllers = require("../Controllers/checkbookControllers");
const authController = require("../Controllers/authControllers");

const router = express.Router();

router.post(
  "/requestCheckbook/:accountNo",
  authController.protect,
  checkbookControllers.requestCheckbook
);
router.patch(
  "/assignCheckbook/:requestId",
  authController.protect,
  authController.restrictTo("admin"),
  checkbookControllers.assignCheckbook
);

module.exports = router;
