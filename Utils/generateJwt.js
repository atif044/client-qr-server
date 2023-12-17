const jwt = require("jsonwebtoken");
const generateJwt = (data) => {
  const token = jwt.sign(data, process.env.JWT_SIGNATURE, { expiresIn: "1d" });
  return token;
};
module.exports = generateJwt;
