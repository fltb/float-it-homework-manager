"use scrict";

const bcrypt = require('bcrypt');
const saltRounds = 5;
const path = require("path");
const { User } = require("./dataDefinations");

const loginNameRe = /^([A-Za-z1-9]{3,20})$/;
const passwordRe = /^(.{6,})$/;
const enrollmentYear = /^(\d{4})$/;
const classNumber = /^(\d{1,2})$/;
const realname = /^([\u4e00-\u9fa5]+)$/

/**
 * @typedef {Object} UserInfos
 * @property {String} loginName
 * @property {String} password
 * @property {String} realName
 * @property {Number} enrollmentYear
 * @property {Number} classNumber
 */

const userManager = {

    /**
     * 
     * @param {UserInfos} infos 
     */
    async registerUser(infos) {

        if (!loginNameRe.test(infos.loginName)) {
            throw new Error("登录名应当为大小写字母或者数字, 不能少于 3 位或大于 20 位。")
        }
        if (!passwordRe.test(infos.password)) {
            throw new Error("密码的位数太短了吧, 至少要 6 位");
        }
        if (!enrollmentYear.test(infos.enrollmentYear)) {
            throw new Error("你确定你的年份" + infos.enrollmentYear + "没有啥问题?");
        }
        if (!classNumber.test(infos.classNumber)) {
            throw new Error("什么奇奇怪怪的班级:" + infos.classNumber);
        }
        if (!realname.test(infos.realName)) {
            throw new Error("你确定你叫做" + infos.realName + "吗?");
        }

        const user = await User.findOne({
            where: {
                loginName: infos.loginName
            }
        });

        if (user !== null) {
            throw new Error("用户名有重复");
        }

        const passwordHash = await bcrypt.hash(infos.password, saltRounds);
        await User.create({
            loginName: infos.loginName,
            passwordHash: passwordHash,
            realName: infos.realName,
            enrollmentYear: infos.enrollmentYear,
            classNumber: infos.classNumber
        });

        return "success";
    },

    /**
     * 
     * @param {String} loginName 
     * @param {String} password 
     * @returns {Number} - the id of this
     */
    async login(loginName, password) {
        if (!loginNameRe.test(loginName)) {
            throw new Error("用户名不合法。")
        }
        if (!passwordRe.test(password)) {
            throw new Error("密码不合规。");
        }

        const user = await User.findOne({
            where: {
                loginName: loginName
            }
        });

        if (user === null) {
            throw new Error("找不到用户登录名");
        }

        if(await bcrypt.compare(password, user.passwordHash)) {
            console.log("Loginned user: " + user.loginName + " id: " + user.id);
            return user.id;
        } else {
            throw new Error("密码错误");
        }
    },

    /**
     * 
     * @param {Number} userid 
     * @returns {User}
     */
    async getUser(userid) {
        return await User.findByPk(userid);
    },

    async delete(loginName) {
        const user = await User.findOne({
            where: {
                loginName: loginName
            }
        });
        console.log("User deleted:")
        console.log(await user.toJSON());
        await user.destroy();
    },

}

module.exports = userManager;
