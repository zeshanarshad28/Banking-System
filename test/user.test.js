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

  afterEach(() => {
    // sandbox.restore();

    console.log(
      "||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    app = rewire("../app");
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
  context("signup", () => {
    it("should successfully SignUp", (done) => {
      let createStub = sandbox.stub(User, "create").resolves(user);
      let mailStub = sandbox
        .stub(Email.prototype, "sendWelcome")
        .returns("fake Email send successfully");
      // .stub({ ...new Email(user, url) }, "sendWelcome")
      //   a = Email.__set__("sendWelcome", () => {
      //     console.log("fake mail.....");
      //   });
      //   let mailerStub = sandbox.stub(Email, a).callsFake(() => {
      //     console.log("in return");
      //     return "This is fake mailer";
      //   });

      // .stub(Email, "sendWelcome")
      //   let messageStub = sandbox
      //     .stub(sms, "message")
      //     .returns("fake msg send successfully");

      //   console.log("mailer stub: ", mailerStub);
      //   console.log("msg stub: ", messageStub);

      // Email.__set__("sendWelcome",mailerStub)
      let returnUser = request(app)
        .post("/api/v1/user/signup")
        .send(sampleUser)
        .set("Content-Type", "application/json")
        .expect(201)
        .end((err, response) => {
          expect(createStub).to.have.been.calledOnce;
          //   expect(mailerStub()).to.be.equal("This is fake mailer");
          //   expect(messageStub).to.be.calledOnce;
          //   expect(messageStub()).to.have.been.calledWithMatch("Congratulations your account has been created successfully",sampleUser.phoneNo)

          expect(err).to.be.null;
          expect(response.body.data.user)
            .to.have.property("name")
            .to.be.equal("user");
          expect(mailStub).has.been.calledOnce;
          //   expect(messageStub).has.been.calledOnce;

          //   expect(createStub).has.been.calledOnce;

          expect(response.body.data.user.name).to.be.equal(sampleUser.name);
          expect(response.body.data.user.email).to.be.equal(sampleUser.email);

          expect(response.body.data.user.phone).to.be.equal(sampleUser.phone);
          if (err) {
            console.log("innnnn erorrrrr");
            throw err;
          }
          done();
        });
    });
  });
  context("Login User ", () => {
    console.log("in login start");

    var sampleLogin = {
      email: "user@gmail.com",
      password: "+923056320218",
    };
    var logedInUser = {
      name: "user",
      password: "abc123",
      phoneNo: "+923056320218",
      CNICNo: 1234567891234,
      password: "$2b$12$eRg.ClNU3ELEYx0nWQX4yen4vZ5QLwWYOoDr1kvFqq/j0BrDQU7oS",
    };
    it("should successfully login with-out 2 way authentication !", (done) => {
      let loginStub = sandbox
        .stub(mongoose.Query.prototype, "select")
        .resolves(user);
      //   let messageStub = sandbox.stub(sms, "message").callsFake(() => {
      //     return "This is fake message";
      //   });
      let correctPasswordStub = sandbox
        .stub(user, "correctPassword")
        .callsFake(() => {
          return "password is correct";
        });
      let login = request(app)
        .post("/api/v1/user/login")
        .send(sampleLogin)

        .expect(200)
        .end((err, response) => {
          expect(loginStub).to.have.been.calledTwice;
          expect(correctPasswordStub()).to.be.equal("password is correct");
          // expect(correctPasswordStub).to.be.calledOnce;
          expect(correctPasswordStub).to.be.calledTwice;

          expect(response.statusCode).to.be.equal(200);
          expect(response.body).to.have.ownProperty("token");
          expect(response.body.data.user.name).to.be.equal(logedInUser.name);
          token = response.body.token;
          done();
        });
    });
    it("should successfully login with 2 way authentication", (done) => {
      let loginStub = sandbox
        .stub(mongoose.Query.prototype, "findOne")
        .resolves(user);
      let hashingStub = sandbox.stub(bcrypt, "compare").callsFake(() => {
        return "Token passed";
      });
      let tokenExpiryStub = sandbox
        .stub(user, "authTokenExpiresAt")
        .callsFake(() => {
          return 5;
        });
      var date = new Date();
      let dateStub = sandbox.stub(Date, "now").callsFake(() => {
        return 2;
      });
      // console.log(tokenExpiryStub, dateStub);
      let loginWithAuth = request(app)
        .post("/api/v1/user/loginWithAuth")
        .send({ email: "user@gmail.com", authToken: "abc" })
        .expect(200)
        .end((err, response) => {
          expect(loginStub).to.have.been.calledOnce;
          //   expect(tokenExpiryStub).to.have.been.calledOnce;

          //   expect(tokenExpiryStub()).to.be.equal("abc");
          expect(response.statusCode).to.be.equal(200);
          expect(response.body).to.have.ownProperty("token");
          expect(response.body.data.user.name).to.be.equal(logedInUser.name);

          done();
        });
    });
  });
  context("Update password==>", () => {
    // beforeEach(() => {
    //   sandbox.restore();
    // });
    // sandbox.restore();
    // token =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNzQ4YTQ5NjYyZGIyNDZjZGZjY2I5MSIsImlhdCI6MTY2ODY2NDQ5OCwiZXhwIjoxNjY4NzUwODk4fQ.pJiWK4yhFZ5ykTbscJlfr8Ee9HDxHNzAFL60JNqRvhU";
    let data = {
      password: "Zeeshan123$",
      confirmPassword: "Zeeshan123$",
    };
    // const passwordStub = sandbox
    //   .stub(mongoose.Query.prototype, "select")
    //   .resolves(user);
    const protectStub = sandbox.stub(User, "findById").returns(user);

    const userSave = sandbox.stub(user, "save").resolves(user);

    // const updateStub = sandbox.stub(User, "save").resolves(user);

    //
    // let currentUserStub = sandbox.stub(User, "findById").resolves(user);
    // let changedPasswordAfter = sandbox
    //   .stub(user, "changedPasswordAfter")
    //   .callsFake(() => {
    //     console.log("ok");
    //   });
    it("should successfully update the user!", (done) => {
      let updateMyPassword = request(app)
        .patch("/api/v1/user/updateMyPassword")
        .send(data)
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .expect(200)
        .end((err, response) => {
          expect(protectStub).to.have.been.calledTwice;
          expect(userSave).to.have.been.calledOnce;

          expect(response.status).to.be.equal(200);
          // expect(response.data.user).to.be.equal(data);

          //   expect(tokenExpiryStub).to.have.been.calledOnce;

          done();
        });
    });
  });
  context("Delete Me==>", () => {
    // sandbox.restore();
    // sinon.restore();
    User.findById.restore();
    console.log("in delete me start");
    const protectStub = sinon.stub(User, "findById").returns(user);
    const findUpdateStub = sandbox
      .stub(User, "findByIdAndUpdate")
      .returns(user);
    it("should successfully delete login user", (done) => {
      let deleteMe = request(app)
        .delete("/api/v1/user/deleteMe")
        .send()
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .expect(200)
        .end((err, response) => {
          expect(protectStub).to.have.been.calledThrice;
          expect(findUpdateStub).to.have.been.calledOnce;

          expect(response.status).to.be.equal(204);
          // expect(response.data.user).to.be.equal(data);

          //   expect(tokenExpiryStub).to.have.been.calledOnce;

          done();
        });
    });
  });
});
