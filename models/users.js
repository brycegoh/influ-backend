const mongoose = require("mongoose");
const promiseBasedQueries = require("./index");
const q = require("q");
const bcrypt = require("bcrypt");
const moment = require("moment");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { randomBytes } = require("crypto");
require("dotenv").config();

const UsersSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
    },
    userType: {
      type: String,
      enum: ["influencer", "merchant", "admin"],
      required: true,
    },
    // projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "projects" }],
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    verifyEmailToken: {
      type: String,
    },
    verifyEmailExpiry: {
      type: Number,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Number,
    },
    stripeCsrfToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UsersSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // const salt = crypto.randomBytes(32).toString('hex')
  // const hash = crypto.pbkdf2Sync(this.password, salt, 10000, 64, 'sha512').toString('hex')
  // need store salt

  bcrypt.hash(this.password, 10, (error, hashedPw) => {
    if (error) {
      return next(error);
    }
    this.password = hashedPw;
    next();
  });
});

class Users extends promiseBasedQueries {
  comparePw(clientPw) {
    let promise = q.defer();
    bcrypt.compare(clientPw, this.password, (error, isMatch) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(isMatch);
      }
    });

    // const hashVerify = crypto.pbkdf2Sync(clientPw, this.salt, 10000, 64, 'sha512').toString('hex')
    // promise.resolve(this.password === hashVerify)

    return promise.promise;
  }

  generateStripeConnectUrl() {
    let promise = q.defer();
    const csrfToken = randomBytes(48).toString("hex");
    this.stripeCsrfToken = csrfToken;
    const clientId = "ca_HZAC21mucPHiYDG2ROjdZ7UKGLWtqGnz";
    const capabilities = "suggested_capabilities[]=transfers";
    const userPrefill = `stripe_user[email]=${this.email}`;
    const stripeConnectUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=${clientId}&state=${csrfToken}&${capabilities}&${userPrefill}`;
    console.log(stripeConnectUrl);
    promise.resolve(stripeConnectUrl);
    return promise.promise;
  }

  emailVerificationEmail() {
    const verificationToken = randomBytes(48).toString("hex");
    const expiryDate = moment().add(10, "minutes").unix();
    this.verifyEmailToken = verificationToken;
    this.verifyEmailExpiry = expiryDate;

    const domain =
      process.env.NODE_ENV === "production"
        ? `${process.env.DOMAIN}:${process.env.PORT}`
        : `${process.env.DEV_CLIENT_URL}`;

    const urlLink = `${domain}/verify-email?upn=${verificationToken}&dat=${expiryDate}`;
    this._save().then(() => {
      const msg = {
        to: "purplecosmics96@gmail.com",
        from: "purplecosmics96@gmail.com",
        subject: "Sending with Twilio SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: `<strong>${urlLink}</strong>`,
        // templateId: "d-243646a081984a49aa7fb8372a2f6728",
        // dynamic_template_data: {
        //   name: "John",
        //   product: [
        //     {
        //       productName: "test",
        //       quantity: "test",
        //       price: "test",
        //     },
        //     {
        //       productName: "test2",
        //       quantity: "test2",
        //       price: "test2",
        //     },
        //   ],
        // },
      };
      sgMail.send(msg).catch((error) => {
        //Log friendly error
        console.error(error.toString());
      });
    });
  }
  verifyEmail(upn, dat) {
    let promise = q.defer();
    if (upn === this.verifyEmailToken && dat === this.verifyEmailExpiry) {
      if (!this.verifiedEmail) {
        this.verifiedEmail = true;
        this.verifyEmailToken = null;
        this.verifyEmailExpiry = null;
        this._save();
        promise.resolve({ status: true, message: "Succesfully Verfied Email" });
        return promise.promise;
      } else {
        promise.reject({ status: false, message: "Email is verified" });
        return promise.promise;
      }
    } else {
      promise.reject({ status: false, message: "Try again" });
      return promise.promise;
    }
  }

  sendResetPasswordEmail() {
    const verificationToken = randomBytes(48).toString("hex");
    const expiryDate = moment().add(10, "minutes").unix();
    this.resetPasswordToken = verificationToken;
    this.resetPasswordExpiry = expiryDate;

    const domain =
      process.env.NODE_ENV === "production"
        ? `${process.env.DOMAIN}:${process.env.PORT}`
        : `${process.env.DEV_CLIENT_URL}`;

    const urlLink = `${domain}/reset-password?upn=${verificationToken}&dat=${expiryDate}`;
    this._save().then(() => {
      const msg = {
        to: "purplecosmics96@gmail.com",
        from: "purplecosmics96@gmail.com",
        subject: "Sending with Twilio SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: `<strong>${urlLink}</strong>`,
      };
      sgMail.send(msg).catch((error) => {
        //Log friendly error
        console.error(error.toString());
      });
    });
  }
  sendResetPasswordNotificationEmail() {
    // const verificationToken = randomBytes(48).toString("hex");
    // const expiryDate = moment().add(10, "minutes").unix();
    // this.resetPasswordToken = verificationToken;
    // this.resetPasswordExpiry = expiryDate;

    const domain =
      process.env.NODE_ENV === "production"
        ? `${process.env.DOMAIN}:${process.env.PORT}`
        : `${process.env.DEV_CLIENT_URL}`;

    const urlLink = `${domain}/forget-password`;
    const msg = {
      to: "purplecosmics96@gmail.com",
      from: "purplecosmics96@gmail.com",
      subject: "Your password recently got resetted",
      text: "and easy to do anywhere, even with Node.js",
      html: `<strong>${urlLink}</strong>`,
    };
    sgMail.send(msg).catch((error) => {
      //Log friendly error
      console.error(error.toString());
    });
  }
}

UsersSchema.loadClass(Users);
const users = mongoose.model("users", UsersSchema);

module.exports = { users, UsersSchema };
