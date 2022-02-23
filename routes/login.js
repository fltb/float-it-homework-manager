const express = require('express');
const router = express.Router();

const config = require("../lib/config").getConfig();
const userManager = require("../lib/users")

/* GET login listing. */
router.get('/', async function(req, res, next) {
    if (req.session.uid && await userManager.getUser(req.session.uid) !== null) {
        res.redirect("/");
    }
    res.render('login', {
        config: config,
        page: {
            title: "登录"
        }
    })
});

router.post('/', async function(req, res, next) {
    try {
        const id = await userManager.login(req.body.loginName, req.body.password);
        req.session.uid = id;
        res.send("success");
    } catch (err) {
        res.send(err.toString());
    }
});

module.exports = router;
