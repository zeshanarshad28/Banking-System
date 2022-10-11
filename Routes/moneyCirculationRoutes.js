const express = require("express");
const moneyCirculationControllers = require("../Controllers/moneyCirculation");
const authControllers = require("../Controllers/authControllers");

const router = express.Router();
router.post(
  "/withdrawMoneyByCheque",
  authControllers.protect,
  authControllers.restrictTo("admin"),
  moneyCirculationControllers.withdrawMoneyByCheque
);
router.patch(
  "/withdrawMoneyByAtmCard",
  authControllers.protect,
  moneyCirculationControllers.withdrawMoneyByAtmCard
);
router.patch(
  "/transferMoneyFromCurrentAccount",
  authControllers.protect,
  moneyCirculationControllers.transferMoneyFromCurrentAccount
);
router.patch(
  "/transferMoneyFromSavingAccount",
  authControllers.protect,
  moneyCirculationControllers.transferMoneyFromSavingAccount
);
module.exports = router;
