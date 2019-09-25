const Authentication = require("./controllers/authentication");

function router(app) {
  app.use("/", Authentication);
}

module.exports = router;
