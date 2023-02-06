import { Model, DataTypes } from 'sequelize';
import { sequelizeConnection } from '../config/database.config';


export enum LINE_ROLE {
    HUMAN = 'Human',
    AI = 'AI'
}

export type LineAttributes = {
    id: number,
    text: string,
    role: LINE_ROLE,
    // chatId: number
}

// Defines type of object passed into Sequelize's model.create
export type LineInput = Pick<LineAttributes, 'text' | 'role' >;
// Defines returned object from model.create, model.update, and model.findOne
export type LineOutput = Required<LineAttributes>;

export default class Line extends Model<LineAttributes, LineInput> implements LineAttributes {
    declare id: number;
    declare text: string;
    declare role: LINE_ROLE;
    // declare chatId: number;
    public readonly createdAt!: Date;

    static initLineTable = async ()=>{
        try {
            await Line.sync({ force: true });
            console.log('Created Line table');
        } catch (error) {
            console.error(error);
        }
    }
}

Line.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM(...Object.values(LINE_ROLE)),
        allowNull: false
    }
}, {
    tableName: 'line',
    timestamps: true,
    sequelize: sequelizeConnection,
    paranoid: true, // soft delete
});

export const LineExample: LineAttributes = {
    id: 12,
    role: LINE_ROLE.HUMAN,
    text:"Are you OK?"
}