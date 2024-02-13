const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const password = 'password';
    const decoded = jwt.verify(token,password);
    req.userData = decoded;
    console.log(req.userData.email)
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
      error: error,
    });
  }
};
