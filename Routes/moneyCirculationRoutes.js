const express = require("express");
const moneyCirculationControllers = require("../controllers/moneyCirculation");
const authControllers = require("../controllers/authControllers");
const depositeControllers = require("../controllers/depositeControllers");
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
router.get(
  "/transactionReport/:accountNo",
  authControllers.protect,
  moneyCirculationControllers.transactionReport
);
router.get(
  "/addMoney/:accountNo/:amount",
  moneyCirculationControllers.addMoney
);
router.get("/paymentFail", moneyCirculationControllers.paymentFail);
router.post("/depositeBySession", depositeControllers.depositeBySession);
router.patch(
  "/interestUpdate/:accountNo",
  moneyCirculationControllers.interestUpdate
);

module.exports = router;
