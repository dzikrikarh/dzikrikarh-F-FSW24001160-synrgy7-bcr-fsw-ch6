const bcrypt = require("bcryptjs");
const userService = require("../../../services/userService");
const jwt = require("jsonwebtoken");
const SALT = 10;

function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT, (err, encryptedPassword) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(encryptedPassword);
    });
  });
}

function checkPassword(encryptedPassword, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, isPasswordCorrect) => {
      if (!!err) {
        reject(err);
        return;
      }

      resolve(isPasswordCorrect);
    });
  });
}

function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SIGNATURE_KEY || "Rahasia");
}



module.exports = {
  async register(req, res) {
    const email = req.body.email;
    const encryptedPassword = await encryptPassword(req.body.password);
    const user = await userService.create({ email, encryptedPassword });
    res.status(201).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  async login(req, res) {
    const email = req.body.email.toLowerCase()
    const password = req.body.password;

    const user = await User.findOne(email);

    if (!user) {
      res.status(404).json({ message: "Email tidak ditemukan" });
      return;
    }

    const isPasswordCorrect = await checkPassword(
      user.encryptedPassword,
      password
    );

    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Password salah!" });
      return;
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });


    res.status(201).json({
      id: user.id,
      email: user.email,
      token: token, // Kita bakal ngomongin ini lagi nanti.
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  async whoAmI(req, res) {
    res.status(200).json(req.user);
  },

  async authorize(req, res, next) {
    try {
      const bearerToken = req.headers.authorization;
      const token = bearerToken.split("Bearer ")[1];
      const tokenPayload = jwt.verify(
        token,
        process.env.JWT_SIGNATURE_KEY || "Rahasia"
      );

      req.user = await userService.get(tokenPayload.id);
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  },


};
