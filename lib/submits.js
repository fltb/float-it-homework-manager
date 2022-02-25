"use scrict";

const fse = require("fs-extra");
const path = require("path");
const { Submit } = require("./dataDefinations");

const submitManager = {

    async submit(title) {

        const submit = await Submit.findOne({
            where: {
                title: title
            }
        });

        const repath = path.join(__dirname, "..", "files", "problems", title + ".md");
        await fse.ensureFile(repath);
        await fse.copy(tempath, repath);
        await Submit.create({
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
    }
}

module.exports = submitManager;
