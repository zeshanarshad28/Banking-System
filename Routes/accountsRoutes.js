const express = require("express");
const accountsControllers = require("../Controllers/accountsControllers");
const authControllers = require("../Controllers/authControllers");

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
