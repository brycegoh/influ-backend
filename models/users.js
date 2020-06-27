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
      type: Date,
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
  emailVerification() {
    let promise = q.defer();
    const verificationToken = randomBytes(48);
    this.verificationToken = verificationToken;
    this.verifyEmailExpiry = moment().add(20, "minutes");
    const domain =
      process.env.NODE_ENV === "production"
        ? `${process.env.DOMAIN}:${process.env.PORT}`
        : `${process.env.DEV_DOMAIN}:${process.env.DEV_PORT}`;
    const urlLink = `${domain}/?${verificationToken}`;
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
        console.log(output);

        //Extract error msg
        const { message, code, response } = error;

        //Extract response msg
        const { headers, body } = response;
      });
    });
  }
}

UsersSchema.loadClass(Users);
const users = mongoose.model("users", UsersSchema);

module.exports = { users, UsersSchema };
