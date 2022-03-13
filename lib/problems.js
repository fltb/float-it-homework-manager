"use strict";

const fse = require("fs-extra");
const path = require("path");
const config = require("./config");
const { Problem, Submit } = require("./dataDefinations");

const titleRex = /^(.{3,})$/

const problemManager = {

    async create(title, content) {        
        if (!titleRex.test(title)) {
            throw new Error("题目标题不得少于三个字");
        }

        const problem = await Problem.findOne({
            where: {
                title: title
            }
        });

        if (problem !== null) {
            throw new Error("问题名称有重复");
        }

        const tempath = path.join(__dirname, "templetes", "problem.md");
        const repath = config.getProblemPath(title);
        await fse.ensureFile(repath);
        await fse.copy(tempath, repath);
        await Problem.create({
            title: title,
        });

        if (!content) {
            console.log(`创建成功, 请到 ${repath} 修改题目描述文件。`);
        } else {
            await fse.writeFile(repath, content);
            console.log(`题目${repath}创建成功`);
        }

        return "success";
    },

    async edit(pid, title, content) {
        if (!titleRex.test(title)) {
            throw new Error("题目标题不得少于三个字");
        }

        const _problem = await Problem.findOne({
            where: {
                title: title
            }
        });

        if (_problem !== null && _problem.id !== pid) {
            throw new Error("问题名称有重复");
        }

        let problem = await Problem.findByPk(pid);
        if (problem === null) {
            throw new Error(`未找到 ID ${pid} 的题目`)
        }
        if (title !== problem.title) {
            console.log(`修改 ID ${pid} 的题目: ${problem.title} 标题为 ${title}`);
            await fse.rename(config.getProblemPath(problem.title), config.getProblemPath(title));
            problem.title = title;
        }
        if (content) {
            await fse.writeFile(config.getProblemPath(problem.title), content);
        }
        await problem.save();
    },

    async delete(Pk) {
        Pk = parseInt(Pk)
        if (Pk === NaN) {
            throw new Error("删除时应当使用 ID 来指定");
        }
        const problem = await Problem.findByPk(Pk);

        /**@type {Array<Submit>} */
        const submits = await problem.getSubmits();

        for (let i = 0; i < submits.length; i++) {
            const submit = submits[i];
            await submit.destroy();
        }
        const repath = config.getProblemPath(problem.title);
        await fse.rm(repath);
        await problem.destroy();
        return;
    },

    /**
     * 
     * @param {*} options  - Sequelize options
     * @returns {Array<Problem>}
     */
    async getAll(options) {
        return await Problem.findAll(options);
    },

    getTemplete() {
        return path.join(__dirname, "templetes", "problem.md");
    }
}

module.exports = problemManager;
