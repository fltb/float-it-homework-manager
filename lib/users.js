"use scrict";

const crypto = require("crypto");
const bcrypt = require('bcrypt');
const saltRounds = 5;
const path = require("path");
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, "..", "databases", "users.sqlite3")
});

class User extends Model { };

User.init({
    // Model attributes are defined here
    loginName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    realName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enrollmentYear: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    classNumber: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    registerDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User' // We need to choose the model name
});

/**
 * @typedef {Object} UserInfos
 * @property {String} loginname
 * @property {String} password
 * @property {String} realname
 * @property {Number} enrollmentyear
 * @property {Number} classnumber
 */

const userManager = {

    /**
     * @type {Object} - logined[token] = User
     */
    logined: {},

    /**
     * 
     * @param {UserInfos} infos 
     */
    async registerUser(infos) {
        await sequelize.sync();

        const loginNameRe = /^([A-Za-z1-9]{3,20})$/;
        const passwordRe = /^(.{6,})$/;
        const enrollmentYear = /^(\d{4})$/;
        const classNumber = /^(\d{1,2})$/;
        const realname = /^([\u4e00-\u9fa5]+)$/
        if (!loginNameRe.test(infos.loginname) || !infos.loginname) {
            throw new Error("登录名应当为大小写字母或者数字, 不能少于 3 位或大于 20 位。")
        }
        if (!passwordRe.test(infos.password || !infos.password)) {
            throw new Error("密码的位数太短了吧, 至少要 6 位");
        }
        if (!enrollmentYear.test(infos.enrollmentyear || !infos.enrollmentyear)) {
            throw new Error("你确定你的年份" + infos.enrollmentyear + "没有啥问题?");
        }
        if (!classNumber.test(infos.classnumber || !infos.classnumber)) {
            throw new Error("什么奇奇怪怪的班级:" + infos.classnumber);
        }
        if (!realname.test(infos.realname || !infos.realname)) {
            throw new Error("你确定你叫做" + infos.realname + "吗?");
        }

        const passwordHash = await bcrypt.hash(infos.password, saltRounds);
        await User.create({
            loginName: infos.loginname,
            passwordHash: passwordHash,
            realName: infos.realname,
            enrollmentYear: infos.enrollmentyear,
            classNumber: infos.classnumber
        });

        return "success";
    },

    /**
     * 
     * @param {String} loginName 
     * @param {String} password 
     */
    async login(loginName, password) {
        await sequelize.sync();

        const user = await User.findOne({
            where: {
                loginName: loginName
            }
        });

        if (user === null) {
            throw new Error("找不到用户登录名");
        }

        if(await bcrypt.compare(password, user.passwordHash)) {
            const token = crypto.randomUUID();
            this.logined[token] = user;
            console.log("Loginned user: " + user.loginName + " token: " + token);
            return token;
        } else {
            throw new Error("密码错误");
        }
    },

    async logout(token) {
        console.log("Logout token:" + token);

        this.logined[token] = undefined;
    },

    async delete(loginName) {
        await sequelize.sync();

        const user = await User.findOne({
            where: {
                loginName: loginName
            }
        });
        console.log("User deleted:")
        console.log(await user.toJSON());
        await user.destroy();
    },

    isLogin(token) {
        return this.logined[token] instanceof User;
    }
}
module.exports = userManager;