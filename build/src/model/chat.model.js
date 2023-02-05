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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatExample = exports.initChatTable = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
class Chat extends sequelize_1.Model {
}
exports.default = Chat;
Chat.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    }
}, {
    tableName: 'chat',
    timestamps: true,
    sequelize: database_config_1.sequelizeConnection,
    paranoid: true, // soft delete
});
const initChatTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Chat.sync({ force: true });
        console.log('Created Activity Summary table');
    }
    catch (error) {
        console.error(error);
    }
});
exports.initChatTable = initChatTable;
exports.ChatExample = {
    id: 12,
};
