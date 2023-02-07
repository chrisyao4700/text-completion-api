import { Sequelize } from 'sequelize';


export const sequelizeConnection = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/text-completion-api.db',
    logging: false
});
export default class DatabaseConfig {
    static async config() {
        try {
            await sequelizeConnection.authenticate();
        } catch (error) {
            console.error('Unable to connect to db', error);
        }
    }
}