"use strict";

const fse = require("fs-extra");
const path = require("path");
const config = require("./config");
const { Problem, Submit } = require("./dataDefinations");

const titleRex = /^(.{3,})$/

const problemManager = {

    async create(title) {        
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

        console.log(`创建成功, 请到 ${repath} 修改题目描述文件。`);

        return "success";
    },

    async delete(Pk) {
        Pk = parseInt(Pk)
        if (Pk === NaN) {
            throw new Error("删除时应当使用 ID 来指定");
        }
        const problem = await Problem.findOne({
            where: {
                id: Pk
            }
        });

        /**@type {Array<Submit>} */
        const submits = await problem.getSubmits();

        for (let i = 0; i < submits.length; i++) {
            const submit = submits[i];
            await submit.destroy();
        }

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
    }
}

module.exports = problemManager;
