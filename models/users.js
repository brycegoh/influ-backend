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
        this.verifyEmailToken = "";
        this.verifyEmailExpiry = "";
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
}

UsersSchema.loadClass(Users);
const users = mongoose.model("users", UsersSchema);

module.exports = { users, UsersSchema };
