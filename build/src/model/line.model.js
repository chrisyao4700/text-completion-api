"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineExample = exports.LINE_ROLE = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
var LINE_ROLE;
(function (LINE_ROLE) {
    LINE_ROLE["HUMAN"] = "Human";
    LINE_ROLE["AI"] = "AI";
})(LINE_ROLE = exports.LINE_ROLE || (exports.LINE_ROLE = {}));
class Line extends sequelize_1.Model {
}
exports.default = Line;
_a = Line;
Line.initLineTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Line.sync({ force: true });
        console.log('Created Line table');
    }
    catch (error) {
        console.error(error);
    }
});
Line.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    text: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(LINE_ROLE)),
        allowNull: false
    }
}, {
    tableName: 'line',
    timestamps: true,
    sequelize: database_config_1.sequelizeConnection,
    paranoid: true, // soft delete
});
exports.LineExample = {
    id: 12,
    role: LINE_ROLE.HUMAN,
    text: "Are you OK?"
};
