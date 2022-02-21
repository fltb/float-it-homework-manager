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
 * @property {String} loginName
 * @property {String} password
 * @property {String} realName
 * @property {Number} enrollmentYear
 * @property {Number} classNumber
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
        if (await User.findAll({
            where: {
                loginName: infos.loginName
            }
        }) !== null) {
            throw new Error("该用户名已经存在");
        }

        const passwordHash = bcrypt.hash(infos.password, saltRounds);
        const user = User.create({
            loginName: infos.loginName,
            passwordHash: passwordHash,
            realName: infos.realName,
            enrollmentYear: infos.enrollmentYear,
            classNumber: infos.classNumber
        });

        await user.save();
    },

    /**
     * 
     * @param {String} loginName 
     * @param {String} password 
     */
    async login(loginName, password) {
        const user = User.findOne({
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
        const user = User.findOne({
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