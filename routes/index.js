const express = require('express');
const router = express.Router();

const config = require("../lib/config").getConfig();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const testInput = [{
    id: 1,
    name: "测试标题一",
    date: "2021-11-05 22:44:10"
  }, {
    id: 2,
    name: "测试标题二",
    date: "2021-11-05 22:44:10"
  }, {
    id: 1,
    name: "测试标题三",
    date: "2021-11-05 22:44:10"
  },];
  
  res.render('index', { 
    config: config,
    page: {
      title: "首页"
    },
    index: {
      table: testInput
    }
  });
});

module.exports = router;
