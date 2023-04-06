const util = require('util');
const asyncHandler = require("express-async-handler");
const { Message } = require("../models/messageModel");
const { User } = require("../models/userModel");
const { Channel } = require("../models/channelModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    // const messages = await Message.find({ chat: req.params.chatId })
    //   .populate("sender", "name pic email")
    //   .populate("chat");
    const messageEntities = await Message.findAll({
      where: { channelId: req.params.chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
      ],
    });
    const messages = messageEntities.map(msg => msg.toJSON());
    // console.log('allMessages messages:', messages);
  
    res.json(messages);
  } catch (error) {
    res.status(400);
    console.error(error);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    content: content,
    channelId: chatId,
    senderId: req.user.id,
  };

  try {
    const newMsgEntity = await Message.create(newMessage);

    const fullMsgEntity = await Message.findByPk(newMsgEntity.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
        {
          model: Channel,
          as: 'channel',
          include: [
            {
              model: User,
              as: 'users',
              attributes: { exclude: ['password'] },
            },
          ],
        },
      ],
    });

    // message = await message.populate("sender", "name pic").execPopulate();
    // message = await message.populate("chat").execPopulate();
    // message = await User.populate(message, {
    //   path: "chat.users",
    //   select: "name pic email",
    // });

    // await Channel.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    const message = fullMsgEntity.toJSON();
    console.log(
      'sendMessage message:', 
      util.inspect(message, {showHidden: false, depth: null, colors: true})
    );
    res.json(message);
  } catch (error) {
    res.status(400);
    console.error(error);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };