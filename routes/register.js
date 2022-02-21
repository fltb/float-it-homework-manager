const express = require('express');
const router = express.Router();
const userManager = require('../lib/users');

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

router.post('/', async function(req, res, next) {
    console.log(req.body);
    try {
        console.log("registing");
        const massage = await userManager.registerUser(req.body);
        console.log("Register: " + massage);
        res.send(massage);
    } catch (err) {
        res.send(err.toString());
    }
});

module.exports = router;
