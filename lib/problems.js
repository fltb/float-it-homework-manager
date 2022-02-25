"use scrict";

const fse = require("fs-extra");
const path = require("path");
const { Problem } = require("./dataDefinations");

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
        const repath = path.join(__dirname, "..", "files", "problems", title + ".md");
        await fse.ensureFile(repath);
        await fse.copy(tempath, repath);
        await Problem.create({
            title: title,
        });

        return "success";
    },

    async getByTitle(title) {
        const problem = await Problem.findOne({
            where: {
                title: title
            }
        });
        return problem;
    },

    async getByPk(Pk) {
        const problem = await Problem.findOne({
            where: {
                id: Pk
            }
        });
        return problem;
    },

    async delete(Pk) {
        if (typeof Pk !== "number") {
            throw new Error("删除时应当使用 ID 来指定");
        }
        const problem = await Problem.findOne({
            where: {
                id: Pk
            }
        });

        await problem.destroy();
        return;
    },

    async exportAll() {
        return await Problem.findAll();
    }
}

module.exports = problemManager;
