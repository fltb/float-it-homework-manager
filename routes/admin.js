const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const ejs = require('ejs');
const path = require('path');
const xlsx = require("node-xlsx");
const contentDisposition = require('content-disposition');
const fse = require('fs-extra');

const config = require("../lib/config");
const userManager = require("../lib/users");
const problemManager = require('../lib/problems');
const submitManager = require('../lib/submits');

const { User, Problem } = require('../lib/dataDefinations');
const createHttpError = require('http-errors');

function ensureAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        res.redirect("/admin/login");
        return false;
    }
    return true;
}

/* GET login listing. */
router.get('/login', async function (req, res, next) {
    if (req.session.isAdmin) {
        res.redirect("/admin");
    }
    res.render('admin-login', {
        config: config.getConfig(),
        page: {
            title: "登录"
        },
        noticeText: `输入密码以登录，如果之前没有登录过，第一次输入的密码将被设置为管理员密码。如忘记密码，请手动删除 config.json 中的 adminhash 属性。`
    })
});

router.post('/login', async function (req, res, next) {
    try {
        const password = req.body.password;
        if (config.getConfig().adminhash) {
            // login
            if (await bcrypt.compare(password, config.getConfig().adminhash)) {
            } else {
                res.send("密码错误");
                return;
            }
        } else {
            // register
            let confg = config.getConfig();
            confg.adminhash = await bcrypt.hash(password, 5);
            config.writeConfig(confg);
        }
        req.session.isAdmin = true;
        res.send('success');
    } catch (err) {
        res.send(err.toString());
    }
});

router.get('/', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    res.redirect("/admin/user");
});

router.get('/user', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    // for user
    const users = await User.findAll() || [];
    const usrPagePath = path.join(__dirname, '..', 'views', 'admin-user.ejs');
    const content = await ejs.renderFile(usrPagePath, { users: users });
    res.render('admin-base', {
        config: config.getConfig(),
        page: {
            title: "编辑用户"
        },
        admin: {
            active: {
                user: true
            },
            content: content
        }
    });
});

router.post('/user/delete', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        await userManager.delete(req.body.id);
        res.send("success");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/user/infos', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const user = await userManager.getUser(req.query.id);
        if (user) {
            res.json(await user.toJSON());
        } else {
            next.apply(createHttpError(404));
        }
    } catch (err) {
        res.send(err.toString())
    }
});

router.post('/user/modify', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        await userManager.ResetUser(req.body.id, req.body);
        res.send("success");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/user/to_excel', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        let users = await User.findAll();

        let datas = [
            ["ID", "姓名", "入学年份", "班级", "登录名", "注册时间"]
        ];

        for (let i = 0; i < users.length; i++) {
            const usr = users[i];
            datas.push([usr.id, usr.realName, usr.enrollmentYear, usr.classNumber, usr.loginName, usr.createdAt])
        };

        const buffer = xlsx.build([{ name: "用户名单", data: datas }]);
        res.set({
            "Content-Disposition": contentDisposition("用户名单.xlsx")
        });
        res.end(buffer);
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/problem', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const problems = await Problem.findAll() || [];
        const problemPagePath = path.join(__dirname, '..', 'views', 'admin-problem.ejs');
        const content = await ejs.renderFile(problemPagePath, { problems: problems });
        res.render('admin-base', {
            config: config.getConfig(),
            page: {
                title: "问题管理"
            },
            admin: {
                active: {
                    problem: true
                },
                content: content
            }
        });
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/problem/to_excel', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        let problems = await Problem.findAll();

        let datas = [
            ["ID", "title", "time"]
        ];

        for (let i = 0; i < problems.length; i++) {
            const problem = problems[i];
            datas.push([problem.id, problem.title, problem.createdAt])
        };

        const buffer = xlsx.build([{ name: "题目列表", data: datas }]);
        res.set({
            "Content-Disposition": contentDisposition("题目列表.xlsx")
        });
        res.end(buffer);
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/problem/new', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const tempath = problemManager.getTemplete();
        res.render('admin-problem-editor', {
            config: config.getConfig(),
            page: {
                title: "新建问题"
            },
            problemEditor: {
                noticeText: "在此页面新建问题",
                content: await fse.readFile(tempath, 'utf-8')
            }
        })
    } catch (err) {
        res.send(err.toString())
    }
});

router.post('/problem/new', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        await problemManager.create(req.body.title, req.body.content);
        res.redirect("/admin/problem");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get(/\/problem\/modify\/(\d+)/, async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const pid = req.params[0];
        const problem = await Problem.findByPk(pid);
        if (!problem) {
            next(createError(404));
            return;
        }
        const proPath = config.getProblemPath(problem.title);
        const mddd = await fse.readFile(proPath, 'utf-8');
        res.render('admin-problem-editor', {
            config: config.getConfig(),
            page: {
                title: "修改问题-" + pid
            },
            problemEditor: {
                noticeText: "修改 ID 为 " + pid + "的问题",
                content: mddd,
                title: problem.title
            }
        })
    } catch (err) {
        res.send(err.toString())
    }
});

router.post(/\/problem\/modify\/(\d+)/, async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const pid = req.params[0];
        await problemManager.edit(pid, req.body.title, req.body.content);
        res.redirect("/admin/problem")
    } catch (err) {
        res.send(err.toString())
    }
});

router.post('/problem/delete', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        await problemManager.delete(req.body.id);
        res.send("success");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/submit', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const datas = await submitManager.getAllData();
        const submitPagePath = path.join(__dirname, '..', 'views', 'admin-submit.ejs');
        const content = await ejs.renderFile(submitPagePath, { datas: datas, filePath: path.join(__dirname, "..", "files", "submits") });
        res.render('admin-base', {
            config: config.getConfig(),
            page: {
                title: "提交信息"
            },
            admin: {
                active: {
                    submit: true
                },
                content: content
            }
        });
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/submit/to_excel', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const buffer = await submitManager.toExcel();
        res.set({
            "Content-Disposition": contentDisposition("提交名单.xlsx")
        });
        res.end(buffer);
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/submit/to_lack_excel', async function (req, res, next) {
    if (!ensureAdmin(req, res, next)) {
        return;
    }
    try {
        const buffer = await submitManager.toLackExcel();
        res.set({
            "Content-Disposition": contentDisposition("缺交名单.xlsx")
        });
        res.end(buffer);
    } catch (err) {
        res.send(err.toString())
    }
});

module.exports = router;
