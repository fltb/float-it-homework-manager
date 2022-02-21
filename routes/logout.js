const express = require('express');
const router = express.Router();

/* GET logout listing. */
router.get('/', function(req, res, next) {
    setTimeout(function() {
        res.redirect('/login');
    }, 500);
});

module.exports = router;
