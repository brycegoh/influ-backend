const corsHandler = (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3000/",
    "http://localhost:5000",
    "http://localhost:5000/",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, csrf-token"
    );
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    }
    return next();
  } else {
    return res.json({
      errorFlag: true,
      message: "Unauthorized Origin",
    });
  }
};

module.exports = {
  corsHandler,
};
