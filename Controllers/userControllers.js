const multer = require("multer");
const sharp = require("sharp");
let User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlersFactory");
const Accounts = require("../Models/accountsModel");
const AtmCard = require("../Models/atmCardModel");
const { findById } = require("../Models/accountsModel");
const { message } = require("../Utils/sms");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
// ...................................................
// Enable two-way Authentication
exports.turnOnAuth = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    twoStepAuthOn: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Two step authentication turned On",
    },
  });
});
// Disable two-way Authentication
exports.turnOffAuth = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    twoStepAuthOn: false,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Two step authentication turned Off !",
    },
  });
});
// Admin Change the role from user to admin
exports.makeAdmin = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { role: "admin" });

  res.status(200).json({
    status: "success",
    data: {
      message: "Role is changed. Now this user is an admin.",
    },
  });
});
// Admin Change the role from admin to user
exports.makeUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { role: "user" });

  res.status(200).json({
    status: "success",
    data: {
      message: "Role is changed. Now this user is an admin.",
    },
  });
});
// Restrict to transfer money
exports.restrictToTransferMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToTransfer: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to transfer money",
    },
  });
});
// Allow to transfer money
exports.allowToTransferMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToTransfer: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to transfer money",
    },
  });
});
// Restrict to Deposite money
exports.restrictToDepositeMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToDeposite: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to deposite money",
    },
  });
});
// Allow to Deposite money
exports.allowToDepositeMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToDeposite: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to deposite money",
    },
  });
});

// Restrict to withdraw money
exports.restrictToWithdrawMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToWithdraw: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "User restricted to withdraw money",
    },
  });
});
// Allow to withdraw money
exports.allowToWithdrawMoney = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { allowedToWithdraw: true });

  res.status(200).json({
    status: "success",
    data: {
      message: "User allowed to withdraw money",
    },
  });
});
// Block user
exports.blockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: true });
  if (!user) {
    return next(new AppError("Enter valid id "));
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "User blocked successfully",
    },
  });
});

// Unblock user
exports.unblockUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: false });
  if (!user) {
    return next(new AppError("Enter valid id "));
  }
  res.status(200).json({
    status: "success",
    data: {
      message: "User is unblocked successfully",
    },
  });
});
//  Request ATM card
exports.requestAtmCard = catchAsync(async (req, res, next) => {
  const oldCard = await AtmCard.findOne({
    userId: req.user._id,
    active: true,
    type: req.body.type,
  });
  console.log(oldCard);
  if (oldCard) {
    await AtmCard.findByIdAndUpdate(oldCard._id, {
      active: false,
    });
  }
  let seconds = Date.now();
  // console.log(seconds);
  let randNumber =
    Math.floor(Math.random() * 1000000000000 + 9999999999999) + Date.now();
  let cardNumber = randNumber + seconds;
  const card = await AtmCard.create({
    atmCardNo: cardNumber,
    type: req.body.type,
    userId: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Atm card requested.",
    },
  });
});

// Admin issue Atm Card
exports.issueAtmCard = catchAsync(async (req, res, next) => {
  const card = await AtmCard.findOne({
    _id: req.params.reqId,
  });
  if (!card) {
    return new AppError("card not found!", 404);
  }
  await AtmCard.findByIdAndUpdate(req.params.reqId, {
    issued: true,
  });
  const { phoneNo } = await AtmCard.findById(card.userId);
  message("Your ATM card is isuued", phoneNo);
  res.status(200).json({
    status: "success",
    data: {
      message: "Atm card issued.",
    },
  });
});
