import { Model, DataTypes, BelongsToManyGetAssociationsMixin, BelongsToManyCreateAssociationMixin } from 'sequelize';
import { sequelizeConnection } from '../config/database.config';
import Line from './line.model';


export type ChatAttributes = {
    id: number,
    title: string
}

// Defines type of object passed into Sequelize's model.create
export type ChatInput = {
    title?: string
};
// Defines returned object from model.create, model.update, and model.findOne
export type ChatOutput = Required<ChatAttributes>;

export default class Chat extends Model<ChatAttributes, ChatInput> implements ChatAttributes {
    declare id: number;
    declare title: string
    public readonly createdAt!: Date;

    declare getLines: BelongsToManyGetAssociationsMixin<Line>;
    declare createLine: BelongsToManyCreateAssociationMixin<Line>;

    static initChatTable = async () => {
        try {
            await Chat.sync({ force: true });
            console.log('Created Chat table');
        } catch (error) {
            console.error(error);
        }
    };
}

Chat.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "New Chat"
    }

}, {
    tableName: 'chat',
    timestamps: true,
    sequelize: sequelizeConnection,
    paranoid: true, // soft delete
});

export const ChatExample: ChatAttributes = {
    id: 12,
    title: "New Chat"
}

Chat.hasMany(Line, { foreignKey: 'chatId' });
Line.belongsTo(Chat, { foreignKey: 'chatId' });