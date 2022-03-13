"use strict";

const fse = require("fs-extra");
const config = require("./config");
const path = require("path");
const { Submit, Problem, User } = require("./dataDefinations");
const xlsx = require("node-xlsx");

const submitManager = {

    /**
     * 
     * @param {User} user 
     * @param {Problem} problem 
     * @param {String} content 
     */
    async submit(user, problem, content) {
        if (!content) {
            throw new Error("内容不能为空");
        }

        let submit = await Submit.findOne({
            where: {
                UserID: user.id,
                ProblemID: problem.id
            }
        });

        if (submit === null) {
            submit = await Submit.create();
            await submit.setUser(user);
            await submit.setProblem(problem);
        }
        await submit.save();

        const subpath = config.getSubmitPath(user, problem);
        await fse.ensureFile(subpath);
        await fse.writeFile(subpath, content);

        return;
    },

    async delete(Pk) {
        if (typeof Pk !== "number") {
            Pk = parseInt(Pk);
        }
        if (Pk === NaN) {
            throw new Error("删除时应当使用 ID 来指定");
        }
        const submit = await Submit.findOne({
            where: {
                id: Pk
            }
        });
        await submit.destroy();
        return;
    },

    async toExcel(user, problem) {
        /**@type {Array<Submit>} */
        let submits;
        if (user && problem) {
            submits = await Submit.findAll({
                where: {
                    UserID: user.id,
                    ProblemID: problem.id
                }
            });
        } else if (user) {
            submits = await Submit.findAll({
                where: {
                    UserID: user.id,
                }
            });
        } else if (problem) {
            submits = await Submit.findAll({
                where: {
                    ProblemID: problem.id
                }
            });
        } else {
            // all
            submits = await Submit.findAll();
        }

        let datas = [
            ["题目ID", "题目标题", "姓名", "入学年份", "班级", "登录名", "提交时间"]
        ];

        for (let i = 0; i < submits.length; i++) {
            const submit = submits[i];
            const prob = await submit.getProblem();
            const usr = await submit.getUser();
            datas.push([prob.id, prob.title, usr.realName, usr.enrollmentYear, usr.classNumber, usr.loginName, submit.updatedAt])
        };

        return xlsx.build([{ name: "提交名单", data: datas }]);
    },

    async toLackExcel(problem, user) {
        /**@type {Array<User>} */
        const allUserList = await User.findAll();
        /**@type {Array<Problem>} */
        let allProblemList = [];
        if (problem instanceof Problem) {
            allProblemList.push(problem)
        } else {
            allProblemList = await Problem.findAll();
        }
        let datas = [
            ["题目ID", "题目标题", "姓名", "入学年份", "班级", "登录名"]
        ];
        for (let i = 0; i < allProblemList.length; i++) {
            const problem_ = allProblemList[i];
            let lackUsrList = [];
            if (user instanceof User) {
                lackUsrList[user.id] = user;
            } else {
                for (let i = 0; i < allUserList.length; i++) {
                    const usr = allUserList[i];
                    lackUsrList[usr.id] = usr;
                }
            }
            const submits = await problem_.getSubmits();
            for (let i = 0; i < submits.length; i++) {
                const submit = submits[i];
                const usr = await submit.getUser();
                lackUsrList[usr.id] = undefined;
            }
            
            for (let i = 0; i < lackUsrList.length; i++) {
                if (lackUsrList[i]) {
                    const usr = lackUsrList[i];
                    datas.push([problem_.id, problem_.title, usr.realName, usr.enrollmentYear, usr.classNumber, usr.loginName,]);
                }
            }
        }
        return xlsx.build([{ name: "缺交名单", data: datas }]);
    }
}

module.exports = submitManager;
