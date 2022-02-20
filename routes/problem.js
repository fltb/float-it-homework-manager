"use strict";

const express = require('express');
const md = require('markdown-it')();
const router = express.Router();

const config = require("../lib/config").getConfig();

/* GET problem listing. */
router.get(/(\d+)/, function(req, res, next) {
  const pid = req.params[0];


  const testMD = `
# 测试用的问题

欢迎来到这个测试问题, 我正在用 Markdown来写它, 并且使用 markdown-it 转换。

`
  const problemHTML = md.render(testMD);

  res.render('problem', {
    config: config,
    page: {
        title: "题目-" + pid
    },
    problem: {
      pid: pid,
      content: problemHTML,
      submitted: false,
      submittedPersonNumber: 111
    }
  });
});

router.post('/',);
module.exports = router;
