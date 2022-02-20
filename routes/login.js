const express = require('express');
const router = express.Router();

const config = require("../lib/config").getConfig();

/* GET login listing. */
router.get('/', function(req, res, next) {
    res.render('login', {
        config: config,
        page: {
            title: "登录"
        }
    })
});

router.post('/', );

module.exports = router;
