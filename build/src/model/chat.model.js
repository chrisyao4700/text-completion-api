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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatExample = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
const line_model_1 = __importDefault(require("./line.model"));
class Chat extends sequelize_1.Model {
}
exports.default = Chat;
_a = Chat;
Chat.initChatTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Chat.sync({ force: true });
        console.log('Created Chat table');
    }
    catch (error) {
        console.error(error);
    }
});
Chat.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "New Chat"
    }
}, {
    tableName: 'chat',
    timestamps: true,
    sequelize: database_config_1.sequelizeConnection,
    paranoid: true, // soft delete
});
exports.ChatExample = {
    id: 12,
    title: "New Chat"
};
Chat.hasMany(line_model_1.default, { foreignKey: 'chatId' });
line_model_1.default.belongsTo(Chat, { foreignKey: 'chatId' });
