const express = require('express');
const router = express.Router();

const config = require("../lib/config").getConfig();
const userManager = require("../lib/users")
const problemManager = require("../lib/problems");
/* GET home page. */
router.get('/', async function(req, res, next) {
  let user;
  if (!req.session.uid) {
    res.redirect("/login");
    return;
  } else {
    user = await userManager.getUser(req.session.uid);
    if (user === null) {
      res.redirect("/login");
      return;
    }
  }

  const problems = await problemManager.getAll();
  
  res.render('index', { 
    config: config,
    page: {
      title: "首页",
      userName: user.loginName
    },
    index: {
      table: problems
    }
  });
});

module.exports = router;
