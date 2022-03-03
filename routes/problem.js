"use strict";

const express = require('express');
const { Problem } = require('../lib/dataDefinations');
const md = require('markdown-it')();
const fse = require("fs-extra");
const router = express.Router();

const config = require("../lib/config");
const userManager = require("../lib/users")
const submitManager = require("../lib/submits")
/* GET problem listing. */
router.get(/(\d+)/, async function(req, res, next) {
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
  const pid = req.params[0];

  const problem = await Problem.findByPk(pid);
  if (problem === null) {
    next(createError(404));
  }

  const proPath = config.getProblemPath(problem.title);
  const mddd = await fse.readFile(proPath, 'utf-8');
  const problemHTML = md.render(mddd);

  const sibmitted = await user.countSubmits();
  const submittedPersonNumber = await problem.countSubmits();

  res.render('problem', {
    config: config,
    page: {
        title: "题目-" + pid,
        userName: user.loginName
    },
    problem: {
      pid: pid,
      content: problemHTML,
      submitted: sibmitted,
      submittedPersonNumber: submittedPersonNumber
    }
  });
});

router.post('/*', async function(req, res, next) {
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
  const pid = req.params[0];
  const problem = await Problem.findByPk(pid);
  if (problem === null) {
    next(createError(404));
  }
  const code = req.body.code;
  submitManager.submit(user, problem, code);
  res.redirect('/problem/' + pid)
});
module.exports = router;
