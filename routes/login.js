const { signedCookie } = require('cookie-parser');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')

const config = require("../lib/config").getConfig();
const userManager = require("../lib/users")

/* GET login listing. */
router.get('/', function(req, res, next) {
    if (req.cookies.token) {
        if (userManager.isLogin(req.cookies.token)) {
            res.redirect("/");
        }
    }
    res.render('login', {
        config: config,
        page: {
            title: "登录"
        }
    })
});

router.post('/', function(req, res, next) {
    console.log(req.body);
    res.send("来自服务端的提示")
});

module.exports = router;
