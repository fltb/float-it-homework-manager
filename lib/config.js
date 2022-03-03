"use strict";

const fs = require('fs');
const path = require("path");

const config = {
    getConfig() {
        if (!this.config) {
            const text = fs.readFileSync(path.join(__dirname, "..", "config.json"));
            this.config = JSON.parse(text);
        }
        return this.config;
    },

    getSubmitPath(user, problem) {
        return path.join(
            __dirname, "..",
            "files",
            "submits",
            problem.title,
            `${user.enrollmentYear}-${user.classNumber}`,
            `${user.realName}-${user.loginName}.py`
        );
    },

    getProblemPath(problem) {
        return path.join(__dirname, "..", "files", "problems", problem + ".md");
    }
}

module.exports = config;