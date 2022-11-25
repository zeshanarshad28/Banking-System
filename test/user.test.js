var chai = require("chai");
var expect = chai.expect;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var sinon = require("sinon");
var sandbox = sinon.createSandbox();
const rewire = require("rewire");
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const Auth = rewire("../controllers/authControllers");
const User = rewire("../models/userModel");
const AtmCard = rewire("../models/atmCardModel");

const ApiFeatures = require("../utils/apiFeatures");

const bcrypt = require("bcrypt");
var app = rewire("../app");
// var app = rewire("../routes/userRoutes");

const Email = require("../utils/email");
const sms = require("../utils/sms");

const auth = rewire("../controllers/authControllers");
const { describe } = require("mocha");

// const { afterEach } = require("mocha");

describe("User", () => {
  var token;
  beforeEach(() => {
    // delete require.cache[require.resolve("../app")];
    // var app = require("../app");
  });

  afterEach(async function () {
    // delete require.cache[require.resolve("../app")];

    app = rewire("../app");
    sandbox.restore();
    // sinon.restore();
    // User.findById.restore();
    // User.findByIdAndUpdate.restore();
    console.log(
      "-=-=-=-=-=-=-=-=-=-=-=<||||||||||||||||||||||[(O)]|||||||||||||||||||||||||>=-=-=-=-=-=-=-=-=-=-=-=-"
    );
    // sandbox.restore();
    // sinon.restore();
  });

  before(() => {
    console.log(".........");
  });

  var user = new User({
    name: "user",
    password: "$2b$12$eRg.ClNU3ELEYx0nWQX4yen4vZ5QLwWYOoDr1kvFqq/j0BrDQU7oS",
    phoneNo: "+923056320218",
    CNICNo: 1234567891234,
    email: "user@gmail.com",
    role: "admin",

    // authTokenExpiresAt: 1519211809934,
  });
  var sampleUser = {
    name: "user",
    password: "abc123",
    phoneNo: "+923056320218",
    CNICNo: 1234567891234,
    email: "user@gmail.com",
    password: "$2b$12$eRg.ClNU3ELEYx0nWQX4yen4vZ5QLwWYOoDr1kvFqq/j0BrDQU7oS",
  };
  let url = "abcd";
  // context("signup", () => {
  //   it("should successfully SignUp", (done) => {
  //     let createStub = sandbox.stub(User, "create").resolves(user);
  //     let mailStub = sandbox
  //       .stub(Email.prototype, "sendWelcome")
  //       .returns("fake Email send successfully");
  //     // .stub({ ...new Email(user, url) }, "sendWelcome")
  //     //   a = Email.__set__("sendWelcome", () => {
  //     //     console.log("fake mail.....");
  //     //   });
  //     //   let mailerStub = sandbox.stub(Email, a).callsFake(() => {
  //     //     console.log("in return");
  //     //     return "This is fake mailer";
  //     //   });

  //     // .stub(Email, "sendWelcome")
  //     //   let messageStub = sandbox
  //     //     .stub(sms, "message")
  //     //     .returns("fake msg send successfully");

  //     //   console.log("mailer stub: ", mailerStub);
  //     //   console.log("msg stub: ", messageStub);

  //     // Email.__set__("sendWelcome",mailerStub)
  //     let returnUser = request(app)
  //       .post("/api/v1/user/signup")
  //       .send(sampleUser)
  //       .set("Content-Type", "application/json")
  //       .expect(201)
  //       .end((err, response) => {
  //         expect(createStub).to.have.been.calledOnce;
  //         expect(mailStub).to.be.calledOnce;

  //         // expect(mailStub).to.be.equal("fake Email send successfully");
  //         // expect(messageStub).to.be.calledOnce;
  //         //   expect(messageStub()).to.have.been.calledWithMatch("Congratulations your account has been created successfully",sampleUser.phoneNo)

  //         expect(err).to.be.null;
  //         expect(response.body.data.user)
  //           .to.have.property("name")
  //           .to.be.equal("user");
  //         expect(mailStub).has.been.calledOnce;
  //         //   expect(messageStub).has.been.calledOnce;

  //         //   expect(createStub).has.been.calledOnce;

  //         expect(response.body.data.user.name).to.be.equal(sampleUser.name);
  //         expect(response.body.data.user.email).to.be.equal(sampleUser.email);

  //         expect(response.body.data.user.phone).to.be.equal(sampleUser.phone);
  //         if (err) {
  //           console.log("innnnn erorrrrr");
  //           throw err;
  //         }
  //         done();
  //       });
  //   });
  // });
  // context("Login User ", () => {
  //   console.log("in login start");

  //   var sampleLogin = {
  //     email: "user@gmail.com",
  //     password: "+923056320218",
  //   };
  //   var logedInUser = {
  //     name: "user",
  //     password: "abc123",
  //     phoneNo: "+923056320218",
  //     CNICNo: 1234567891234,
  //     password: "$2b$12$eRg.ClNU3ELEYx0nWQX4yen4vZ5QLwWYOoDr1kvFqq/j0BrDQU7oS",
  //   };
  //   it("should successfully login with-out 2 way authentication !", (done) => {
  //     // let loginStub = sandbox
  //     //   .stub(mongoose.Query.prototype, "select")
  //     //   .resolves(user); //<<---------------------------------------------------
  //     let loginStub = sandbox
  //       .stub(mongoose.Query.prototype, "select")
  //       .callsFake(() => {
  //         return user;
  //       });
  //     // let loginStub = sandbox.stub(User, "findOne").resolves(user);
  //     //   let messageStub = sandbox.stub(sms, "message").callsFake(() => {
  //     //     return "This is fake message";
  //     //   });
  //     let correctPasswordStub = sandbox
  //       .stub(user, "correctPassword")
  //       .callsFake(() => {
  //         return "password is correct";
  //       });
  //     let login = request(app)
  //       .post("/api/v1/user/login")
  //       .send(sampleLogin)

  //       .expect(200)
  //       .end((err, response) => {
  //         expect(loginStub).to.have.been.calledTwice;
  //         expect(correctPasswordStub).to.be.calledOnce;
  //         expect(correctPasswordStub()).to.be.equal("password is correct");
  //         // expect(correctPasswordStub).to.be.calledOnce;

  //         expect(response.statusCode).to.be.equal(200);
  //         expect(response.body).to.have.ownProperty("token");
  //         expect(response.body.data.user.name).to.be.equal(logedInUser.name);
  //         token = response.body.token;
  //         // sandbox.restore();
  //         // sinon.restore();
  //         // loginStub.restore();
  //         // correctPasswordStub.restore();
  //         done();
  //       });
  //   });
  //   it("should successfully login with 2 way authentication", (done) => {
  //     let loginStub2 = sandbox
  //       .stub(mongoose.Query.prototype, "findOne")
  //       .callsFake(() => {
  //         return user;
  //       });
  //     let hashingStub = sandbox.stub(bcrypt, "compare").callsFake(() => {
  //       return "Token passed";
  //     });
  //     // let tokenExpiryStub = sandbox
  //     //   .stub(user, "authTokenExpiresAt")
  //     //   .callsFake(() => {
  //     //     return 5;
  //     //   });
  //     var date = new Date();
  //     let dateStub = sandbox.stub(Date, "now").callsFake(() => {
  //       return 2;
  //     });
  //     // console.log(tokenExpiryStub, dateStub);
  //     let loginWithAuth = request(app)
  //       .post("/api/v1/user/loginWithAuth")
  //       .send({ email: "user@gmail.com", authToken: "abc" })
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(loginStub2).to.have.been.calledOnce;
  //         // expect(tokenExpiryStub).to.have.been.calledOnce; //-----------------issue
  //         expect(hashingStub).to.have.been.calledOnce;

  //         //   expect(tokenExpiryStub()).to.be.equal("abc");
  //         expect(response.statusCode).to.be.equal(200);
  //         expect(response.body).to.have.ownProperty("token");
  //         expect(response.body.data.user.name).to.be.equal(logedInUser.name);
  //         // hashingStub.restore();
  //         // dateStub.restore();
  //         // loginStub2.restore();
  //         done();
  //       });
  //   });
  // });
  // // Forgot Password::=======>>
  // context("Forgot Password==>", () => {
  //   const userFindOneStub = sandbox.stub(User, "findOne").callsFake(() => {
  //     return user;
  //   });
  //   const resetToken = "abcd1234";
  //   const resetTokenStub = sandbox
  //     .stub(user, "creatPasswordResetToken")
  //     .callsFake(() => {
  //       return resetToken;
  //     });
  //   const userSaveStub = sandbox.stub(user, "save").resolves(user);
  //   let mailStub = sandbox
  //     .stub(Email.prototype, "sendPasswordReset")
  //     .returns("fake Email send successfully");

  //   it("should successfully send token for forgot password API", (done) => {
  //     let forgotPassword = request(app)
  //       .post(`/api/v1/user/forgotPassword`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(userFindOneStub).to.have.been.calledOnce; //  times
  //         expect(resetTokenStub).to.have.been.calledOnce;
  //         expect(userSaveStub).to.have.been.calledOnce;
  //         expect(mailStub).to.have.been.calledOnce;

  //         expect(response.status).to.be.equal(200);
  //         done();
  //       });
  //   });
  // });
  // Reset  Password::=======>>
  // context("Reset Password==>", () => {
  //   const resetTokenn = "abc1234";
  //   const userFindOneStub = sandbox.stub(User, "findOne").callsFake(() => {
  //     return user;
  //   });
  //   const userSaveStub = sandbox.stub(user, "save").resolves(user);

  //   it("should successfully reset for  password ", (done) => {
  //     let forgotPassword = request(app)
  //       .patch(`/api/v1/user/resetPassword/${resetTokenn}`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(userFindOneStub).to.have.been.calledOnce; //  times

  //         expect(userSaveStub).to.have.been.calledOnce;

  //         expect(response.status).to.be.equal(200);
  //         done();
  //       });
  //   });
  // });
  // context("Update password==>", () => {
  //   // sinon.restoreObject(User); // giving error expected to give object but found none

  //   // before(() => {
  //   //   sinon.restore();
  //   // });
  //   // beforeEach(() => {
  //   // sandbox.restore();
  //   // });
  //   // sandbox.restore();
  //    var token =
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTI3NTM5MywiZXhwIjoxNjY5MzYxNzkzfQ.yFvRcXvribyP4D_0CuJwZfkrU9OjwImIZO5fTKYMidU";
  //   let data = {
  //     password: "Zeeshan123$",
  //     confirmPassword: "Zeeshan123$",
  //   };
  //   // const passwordStub = sandbox
  //   //   .stub(mongoose.Query.prototype, "select")
  //   //   .callsFake(() => {
  //   //   return user;
  //   // });
  //   const protectStub1 = sandbox.stub(User, "findById").returns(user);

  //   const userSave = sandbox.stub(user, "save").resolves(user);

  //   // const updateStub = sandbox.stub(User, "save").resolves(user);

  //   //
  //   // let currentUserStub = sandbox.stub(User, "findById").resolves(user);
  //   // let changedPasswordAfter = sandbox
  //   //   .stub(user, "changedPasswordAfter")
  //   //   .callsFake(() => {
  //   //     console.log("ok");
  //   //   });
  //   it("should successfully update the user!", (done) => {
  //     let updateMyPassword = request(app)
  //       .patch("/api/v1/user/updateMyPassword")
  //       .send(data)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub1).to.have.been.calledTwice; //--------------------------<<<
  //         expect(userSave).to.have.been.calledOnce;

  //         expect(response.status).to.be.equal(200);
  //         // expect(response.data.user).to.be.equal(data);

  //         //   expect(tokenExpiryStub).to.have.been.calledOnce;
  //         // protectStub1.restore();
  //         // userSave.restore();

  //         done();
  //       });
  //   });
  // });

  // // Get Me ( logged in user)
  // context("Get Me  User==>", () => {
  //   // sandbox.restore();
  //   // sandbox.resetHistory();
  //   // sandbox.resetBehavior();
  //   // sandbox.reset();
  //   // after(() => {
  //   // sinon.restoreObject(User);
  //   // sinon.restoreObject(User.prototype);

  //   // });
  //   // before(() => {
  //   // sinon.restoreObject(User);
  //   // sandbox.restore();
  //   // });
  //   // sinon.restore();
  //   // User.findById.restore();
  //   // User.findByIdAndUpdate.restore();
  //   // User.findOne.restore();
  //   // var token =
  //   //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTI3NTM5MywiZXhwIjoxNjY5MzYxNzkzfQ.yFvRcXvribyP4D_0CuJwZfkrU9OjwImIZO5fTKYMidU";
  //   //   let data = {
  //   const id = 12345678;
  //   console.log("in Get Me (logged in user) User");
  //   const protectStub6 = sandbox.stub(User, "findById").returns(user);

  //   const findOneStub = sandbox.stub(User, "findOne").returns(user);
  //   it("should successfully get me (login user) user", (done) => {
  //     let getUser = request(app)
  //       .get(`/api/v1/user/me`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub6).to.have.been.calledOnce;
  //         expect(findOneStub).to.have.been.calledOnce;
  //         expect(response.status).to.be.equal(200);

  //         done();
  //       });
  //   });
  // });
  // Update Me
  // context("Update Me==>", () => {
  //   var token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTI3NTM5MywiZXhwIjoxNjY5MzYxNzkzfQ.yFvRcXvribyP4D_0CuJwZfkrU9OjwImIZO5fTKYMidU";
  //   let data = {
  //     name: "Zeeshan",
  //   };

  //   const protectStub7 = sandbox.stub(User, "findById").returns(user);

  //   const findByIdAndUpdateStub = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .resolves(user);

  //   it("should successfully update me  !", (done) => {
  //     let updateMe = request(app)
  //       .patch("/api/v1/user/updateMe")
  //       .send(data)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub7).to.have.been.calledOnce; //------should1--------------------<<<
  //         expect(findByIdAndUpdateStub).to.have.been.calledOnce; // should 1

  //         expect(response.status).to.be.equal(200);
  //         // expect(response.data.user).to.be.equal(data);

  //         //   expect(tokenExpiryStub).to.have.been.calledOnce;
  //         // protectStub1.restore();
  //         // userSave.restore();

  //         done();
  //       });
  //   });
  // });
  // Delete me
  // context("Delete  Me==>", () => {
  //   var token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTI3NTM5MywiZXhwIjoxNjY5MzYxNzkzfQ.yFvRcXvribyP4D_0CuJwZfkrU9OjwImIZO5fTKYMidU";

  //   const protectStub8 = sandbox.stub(User, "findById").returns(user);

  //   const findByIdAndUpdateStub2 = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .resolves(user);

  //   it("should successfully update me  !", (done) => {
  //     let deleteMe = request(app)
  //       .delete("/api/v1/user/deleteMe")

  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub8).to.have.been.calledOnce; //------should1--------------------<<<
  //         expect(findByIdAndUpdateStub2).to.have.been.calledOnce; // should 1

  //         expect(response.status).to.be.equal(204);

  //         done();
  //       });
  //   });
  // });
  // // Get All Users
  // context("Get All Users==>", () => {
  //   var token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTI3NTM5MywiZXhwIjoxNjY5MzYxNzkzfQ.yFvRcXvribyP4D_0CuJwZfkrU9OjwImIZO5fTKYMidU";

  //   const protectStub9 = sandbox.stub(User, "findById").returns(user);

  //   // const featuresStub = sandbox
  //   //   .stub(new ApiFeatures(), "query")
  //   //   .resolves([sampleUser, user]);
  //   const findStub = sandbox.stub(User, "find").resolves([sampleUser, user]);

  //   it("should get all users", (done) => {
  //     let allUsers = request(app)
  //       .get("/api/v1/user/getAllUsers")

  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub9).to.have.been.calledOnce; //------should1--------------------<<<
  //         expect(featuresStub).to.have.been.calledOnce; // should 1

  //         expect(response.status).to.be.equal(200);

  //         done();
  //       });
  //   });
  // });
  // context("Delete Me==>", () => {
  //   // sinon.restoreObject(User);
  //   // before(() => {
  //   //   sinon.restore();
  //   // });
  //   sandbox.restore();
  //   // sinon.restore();
  //   // User.findById.restore();
  //   // var token =
  //   //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzN2RjNTBiOGMxNTQwZGY2MWRkZWZjOCIsImlhdCI6MTY2OTE4ODE5MSwiZXhwIjoxNjY5Mjc0NTkxfQ.Bkx-6LsbIk2jR-4AtBL4E3fc_55sPkJnEMb10hUNoSU";
  //   console.log("in delete me start");
  //   const protectStub2 = sandbox.stub(User, "findById").returns(user);
  //   const findUpdateStub = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .returns(user);
  //   it("should successfully delete login user", (done) => {
  //     let deleteMe = request(app)
  //       .delete("/api/v1/user/deleteMe")
  //       .send()
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub2).to.have.been.calledOnce; //<<< 0 times-----------------------
  //         expect(findUpdateStub).to.have.been.calledOnce; //<<---0 times---------
  //         expect(response.status).to.be.equal(204);
  //         // expect(response.data.user).to.be.equal(data);

  //         //   expect(tokenExpiryStub).to.have.been.calledOnce;
  //         protectStub2.restore();
  //         findUpdateStub.restore();
  //         done();
  //       });
  //   });
  // });

  // // Get single User
  // context("Get Single User  User==>", () => {
  //   // sandbox.restore();
  //   // sandbox.resetHistory();
  //   // sandbox.resetBehavior();
  //   // sandbox.reset();
  //   // after(() => {
  //   // sinon.restoreObject(User);
  //   // sinon.restoreObject(User.prototype);

  //   // });
  //   // before(() => {
  //   // sinon.restoreObject(User);
  //   // sandbox.restore();
  //   // });
  //   // sinon.restore();
  //   // User.findById.restore();
  //   // User.findByIdAndUpdate.restore();
  //   // User.findOne.restore();
  //   // var token =
  //   //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzN2RjNTBiOGMxNTQwZGY2MWRkZWZjOCIsImlhdCI6MTY2OTE4ODE5MSwiZXhwIjoxNjY5Mjc0NTkxfQ.Bkx-6LsbIk2jR-4AtBL4E3fc_55sPkJnEMb10hUNoSU";
  //   const id = 12345678;
  //   console.log("in Get User User");
  //   const protectStub4 = sandbox.stub(User, "findById").returns(user);
  //   // let selectStub = sandbox
  //   //   .stub(mongoose.Query.prototype, "select")
  //   //   .callsFake(() => {
  //   //   return user;
  //   // });
  //   const findOneStub = sandbox.stub(User, "findOne").returns(user);
  //   it("should successfully get single user", (done) => {
  //     let getUser = request(app)
  //       .get(`/api/v1/user/getSingleUser/${id}`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub4).to.have.been.calledOnce;
  //         expect(findOneStub).to.have.been.calledOnce;
  //         expect(response.status).to.be.equal(200);
  //         protectStub4.restore();

  //         done();
  //       });
  //   });
  // });

  // // // // block user.
  // context("Block User==>", () => {
  //   // sinon.restoreObject(User);

  //   // before(() => {
  //   //   sandbox.restore();
  //   // });
  //   sandbox.restore();
  //   // sinon.restore();
  //   // User.findById.restore();
  //   // User.findByIdAndUpdate.restore();
  //   // let token =
  //   //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzN2RjNTBiOGMxNTQwZGY2MWRkZWZjOCIsImlhdCI6MTY2OTE4ODE5MSwiZXhwIjoxNjY5Mjc0NTkxfQ.Bkx-6LsbIk2jR-4AtBL4E3fc_55sPkJnEMb10hUNoSU";
  //   const id = 12345678;
  //   console.log("in Block User");
  //   const protectStub3 = sandbox.stub(User, "findById").returns(user);
  //   const findUpdateStub2 = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .returns(user);
  //   it("should successfully block user", (done) => {
  //     let blockUser = request(app)
  //       .patch(`/api/v1/user/blockUser/${id}`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         // expect(protectStub3).to.have.been.calledOnce;----// 4 times
  //         // expect(findUpdateStub).to.have.been.calledOnce; //----Twise
  //         expect(response.status).to.be.equal(200);
  //         done();
  //       });
  //   });
  // });

  // // // Turn on two step auth..
  // context("Turn on 2-step authentication==>", () => {
  //   let token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTM1NTMwNywiZXhwIjoxNjY5NDQxNzA3fQ.PGMnQ3HBXEovdJnxWa9U8UhncpADIJhy9KDqJ-o0bQk";

  //   const protectStub10 = sandbox.stub(User, "findById").returns(user);
  //   const findUpdateStub3 = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .returns(user);
  //   it("should successfully turn on 2-step auth", (done) => {
  //     let blockUser = request(app)
  //       .patch(`/api/v1/user/turnOnAuth`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub10).to.have.been.calledTwice; // should 2 times
  //         expect(findUpdateStub3).to.have.been.calledOnce; //----should once
  //         expect(response.status).to.be.equal(200);
  //         done();
  //       });
  //   });
  // });
  // // Turn off two step auth..
  // context("Turn off 2-step authentication==>", () => {
  //   let token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTM1NTMwNywiZXhwIjoxNjY5NDQxNzA3fQ.PGMnQ3HBXEovdJnxWa9U8UhncpADIJhy9KDqJ-o0bQk";

  //   const protectStub11 = sandbox.stub(User, "findById").returns(user);
  //   const findUpdateStub4 = sandbox
  //     .stub(User, "findByIdAndUpdate")
  //     .returns(user);
  //   it("should successfully turn off 2-step auth", (done) => {
  //     let blockUser = request(app)
  //       .patch(`/api/v1/user/turnOffAuth`)
  //       .send(user)
  //       .set("Content-Type", "application/json")
  //       .set("authorization", `Bearer ${token}`)
  //       .expect(200)
  //       .end((err, response) => {
  //         expect(protectStub11).to.have.been.calledTwice; // should 2 times
  //         expect(findUpdateStub4).to.have.been.calledOnce; //----should once
  //         expect(response.status).to.be.equal(200);
  //         done();
  //       });
  //   });
  // });

  //Request ATM card
  context("Request ATM card==>", () => {
    let token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2OTM1NTMwNywiZXhwIjoxNjY5NDQxNzA3fQ.PGMnQ3HBXEovdJnxWa9U8UhncpADIJhy9KDqJ-o0bQk";

    const protectStub11 = sandbox.stub(User, "findById").returns(user);
    const findOneStub = sandbox.stub(AtmCard, "findOne").returns({});
    const findUpdateStub5 = sandbox
      .stub(AtmCard, "findByIdAndUpdate")
      .returns({});
    it("should successfully Request ATM card", (done) => {
      let blockUser = request(app)
        .post(`/api/v1/user/requestAtmCard`)
        .send(user)
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .expect(200)
        .end((err, response) => {
          expect(protectStub11).to.have.been.calledTwice; // should 2 times
          expect(findUpdateStub5).to.have.been.calledOnce; //----should once
          expect(response.status).to.be.equal(200);
          done();
        });
    });
  });
});
