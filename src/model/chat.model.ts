import { Model, DataTypes } from 'sequelize';
import { sequelizeConnection } from '../config/database.config';



export type ChatAttributes = {
    id: number,
}

// Defines type of object passed into Sequelize's model.create
export type ChatInput = {};
// Defines returned object from model.create, model.update, and model.findOne
export type ChatOutput = Required<ChatAttributes>;

export default class Chat extends Model<ChatAttributes, ChatInput> implements ChatAttributes {
    declare id: number;
    public readonly created_at!: Date;
}

Chat.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique:true
    }
}, {
    tableName: 'chat',
    timestamps: true,
    sequelize: sequelizeConnection,
    paranoid: true, // soft delete
});

export const initChatTable = async () => {
    try {
        await Chat.sync({ force: true });
        console.log('Created Activity Summary table');
    } catch (error) {
        console.error(error);
    }
}

export const ChatExample: ChatAttributes = {
    id: 12,
}