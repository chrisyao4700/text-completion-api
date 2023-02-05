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
exports.sequelizeConnection = void 0;
const sequelize_1 = require("sequelize");
exports.sequelizeConnection = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'db/cosmos-to-cosmos.db',
    logging: false
});
// import { initSupportTable } from "../model/supportModel";
class DatabaseConfig {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.sequelizeConnection.authenticate();
                console.log('Connected to db');
                // Create support table
                // await initSupportTable();
            }
            catch (error) {
                console.error('Unable to connect to db', error);
            }
        });
    }
}
exports.default = DatabaseConfig;
