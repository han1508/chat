const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");


const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
  },
  channelId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'channels',
  underscored: true,
  timestamps: false,
});

module.exports = {
  Message,
};
