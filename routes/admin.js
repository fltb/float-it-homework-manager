const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const config = require("../lib/config");
const userManager = require("../lib/users");
const { User } = require('../lib/dataDefinations');
const createHttpError = require('http-errors');

function ensureAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        res.redirect("/admin/login");
    }
}

/* GET login listing. */
router.get('/login', async function(req, res, next) {
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

router.post('/login', async function(req, res, next) {
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
        res.send("success");
    } catch (err) {
        res.send(err.toString());
    }
});

router.get('/', async function(req, res, next) {
    ensureAdmin(req, res, next);
    res.redirect("/admin/user");
});

router.get('/user', async function(req, res, next) {
    ensureAdmin(req, res, next);
    res.render('admin-user', {
        config: config.getConfig(),
        page: {
            title: "登录"
        },
        active: {
            user: true
        },
        // for user
        users: await User.findAll()
    });
});

router.post('/user/delete', async function(req, res, next) {
    ensureAdmin(req, res, next);
    try {
        await userManager.delete(req.body.id);
        res.send("success");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/user/modify', async function(req, res, next) {
    ensureAdmin(req, res, next);
    try {
        const user = await userManager.getUser(req.body.id);
        if (user) {
            res.json(await user.toJSON());
        } else {
            next.apply(createHttpError(404));
        }
    } catch (err) {
        res.send(err.toString())
    }
});

router.post('/user/modify', async function(req, res, next) {
    ensureAdmin(req, res, next);
    try {
        await userManager.ResetUser(req.body);
        res.send("success");
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/user/to_excel', async function(req, res, next) {
    ensureAdmin(req, res, next);
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
        res.writeHead(200, [
            ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            ["Content-Disposition", "attachment; filename=" + `用户名单.xlsx`]
        ]);
        res.end(Buffer.from(buffer, 'base64'));
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/problem/modify', async function(req, res, next) {
    ensureAdmin(req, res, next);
    try {
        const user = await userManager.getUser(req.body.id);
        if (user) {
            res.json(await user.toJSON());
        } else {
            next.apply(createHttpError(404));
        }
    } catch (err) {
        res.send(err.toString())
    }
});

router.get('/submit/to_excel', async function(req, res, next) {
    ensureAdmin(req, res, next);
    try {
        const buffer = submitManager.toExcel(options.problem, options.user);
    } catch (err) {
        res.send(err.toString())
    }
});

module.exports = router;
