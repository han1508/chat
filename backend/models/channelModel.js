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
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  // latestMessageId: {
  //   type: DataTypes.INTEGER,
  // },
  adminId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'channels',
  underscored: true,
  timestamps: false,
});


// Channel.Messages = Channel.hasMany(Message, { as: 'messages' });
Message.belongsTo(Channel, { as: 'channel' });
// Channel.hasOne(Message, { as: 'latestMessage' });
// User.Admin = User.hasMany(Channel, { as: 'admin' });
Channel.Admin = Channel.belongsTo(User, { as: 'admin' });

const ChannelUser = sequelize.define('ChannelUser', {
  channelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'channel_user',
  underscored: true,
  timestamps: false,
});

Channel.belongsToMany(User, { as: 'users', through: ChannelUser });
User.belongsToMany(Channel, { as: 'channels', through: ChannelUser });
ChannelUser.belongsTo(Channel);
ChannelUser.belongsTo(User);


module.exports = {
  Channel,
  ChannelUser,
};