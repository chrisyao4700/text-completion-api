import { Model, DataTypes,BelongsToManyGetAssociationsMixin, BelongsToManyCreateAssociationMixin } from 'sequelize';
import { sequelizeConnection } from '../config/database.config';
import Line from './line.model';


export type UserAttributes = {
    id: number,
    userId: string,
    chatId: number,
    messageId?:number
}

// Defines type of object passed into Sequelize's model.create
export type UserInput = {
    chatId: number,
    userId: string,
};
// Defines returned object from model.create, model.update, and model.findOne
export type UserOutput = Required<UserAttributes>;

export default class User extends Model<UserAttributes, UserInput> implements UserAttributes {
    declare id: number;

    declare userId: string;
    declare chatId: number;
    declare messageId: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initUserTable = async ()=>{
        try {
            await User.sync({ force: true });
            console.log('Created User table');
        } catch (error) {
            console.error(error);
        }
    };
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    userId:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'user_id'
    },
    chatId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'chat_id'
    },
    messageId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'message_id'
    }
}, {
    tableName: 'user',
    timestamps: true,
    sequelize: sequelizeConnection,
    paranoid: true, // soft delete
});

export const UserExample: UserAttributes = {
    id: 12,
    userId: "wechat-text",
    chatId: 2
}
