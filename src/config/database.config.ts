import { Sequelize} from 'sequelize';

export const sequelizeConnection = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/cosmos-to-cosmos.db',
    logging: false
});

// import { initSupportTable } from "../model/supportModel";

export default class DatabaseConfig {
    static async init() {
        try {
            await sequelizeConnection.authenticate();
            console.log('Connected to db');

            // Create support table
            // await initSupportTable();

        } catch (error) {
            console.error('Unable to connect to db', error);
        }
    }
}