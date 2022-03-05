const { Sequelize, Model, DataTypes } = require('sequelize');
const path = require("path");
const fse = require("fs-extra");
fse.ensureFile(path.join(__dirname, "..", "databases", "datas.sqlite3"));
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, "..", "databases", "datas.sqlite3"),
    logging: false
});

class User extends Model { };

User.init({
    // Model attributes are defined here
    loginName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'User' // We need to choose the model name
});


class Problem extends Model { };

Problem.init({
    // Model attributes are defined here
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Problem' // We need to choose the model name
});

class Submit extends Model { };

Submit.init({
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Submit' // We need to choose the model name
});

Submit.belongsTo(User);
Submit.belongsTo(Problem);
User.hasMany(Submit);
Problem.hasMany(Submit);

sequelize.sync();

module.exports = {
    User,
    Problem,
    Submit,
}