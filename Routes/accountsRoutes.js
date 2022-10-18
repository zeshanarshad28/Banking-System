const express = require("express");
const accountsControllers = require("../controllers/accountsControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router();
router.post(
  "/createAccount",
  authControllers.protect,
  accountsControllers.createAccount
);
router.get(
  "/checkBalance/:num",
  authControllers.protect,
  accountsControllers.checkBalance
);
module.exports = router;
