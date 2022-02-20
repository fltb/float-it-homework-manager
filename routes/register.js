const express = require('express');
const router = express.Router();

const config = require("../lib/config").getConfig();

/* GET register listing. */
router.get('/', function(req, res, next) {
    res.render('register', {
        config: config,
        page: {
            title: "注册"
        }
    });
});

router.post('/',);

module.exports = router;
