const express = require('express');
const router = express.Router();

/* GET logout listing. */
router.get('/', function (req, res, next) {
    req.session.destroy(function (err) {
        console.log(err);
    })
    setTimeout(function () {
        res.redirect('/login');
    }, 500);
});

module.exports = router;
