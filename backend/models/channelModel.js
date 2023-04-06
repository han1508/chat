const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { Message } = require('./messageModel');
const { User } = require('./userModel');

const Channel = sequelize.define("Channel", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isGroupChat: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  latestMessageId: {
    type: DataTypes.INTEGER,
  },
  adminId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'channels',
  underscored: true,
  timestamps: false,
});


Channel.Messages = Channel.hasMany(Message, { as: 'messages' });
// User.Admin = User.hasMany(Channel, { as: 'admin' });
Channel.Admin = Channel.belongsTo(User, { as: 'admin' });

const ChannelUser = sequelize.define('ChannelUser', {
  ChannelId: {
    type: DataTypes.INTEGER,
    references: {
      model: Channel,
      key: 'id'
    }
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'channel_user',
  underscored: true
});

Channel.belongsToMany(User, { as: 'users', through: ChannelUser });
User.belongsToMany(Channel, { as: 'channels', through: ChannelUser });


module.exports = {
  Channel,
  ChannelUser,
};