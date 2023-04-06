const asyncHandler = require("express-async-handler");
const { Channel, ChannelUser } = require("../models/channelModel");
const { User } = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId: theirUserId } = req.body;
  const myUserId = req.user.id;

  if (!theirUserId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  const channelUserEntities = await ChannelUser.findAll({
    where: { userId: myUserId },
    include: [
      {
        model: Channel,
          include: [
            {
              model: User,
              as: 'users',
              through: ChannelUser,
              attributes: { exclude: ['password'] },
            },
          ],
      },
    ],
  });
  const myChannels = channelUserEntities.map(c => c.Channel.toJSON());
  const channelWithThem = myChannels.find(
    ch => ch.users.length === 1 && ch.users[0].id === theirUserId
  );

  // var isChat = await Channel.find({
  //   isGroupChat: false,
  //   $and: [
  //     { users: { $elemMatch: { $eq: req.user.id } } },
  //     { users: { $elemMatch: { $eq: userId } } },
  //   ],
  // })
  //   .populate("users", "-password")
  //   .populate("latestMessage");

  // isChat = await User.populate(isChat, {
  //   path: "latestMessage.sender",
  //   select: "name pic email",
  // });

  if (channelWithThem) {
    res.send(channelWithThem);
    return;
  }
  try {
    const createdChannel = await Channel.create({
      chatName: "sender",
      isGroupChat: false,
      adminId: myUserId,
    });
    await createdChannel.setUsers([myUserId, theirUserId]);

    // const FullChat = await Channel.findOne({ id: createdChat.id }).populate(
    //   "users",
    //   "-password"
    // );

    const fullChannelEntity = await Channel.findByPk(createdChannel.id, {
      include: [
        {
          model: User,
          as: 'users',
          through: ChannelUser,
          attributes: { exclude: ['password'] },
        },
      ],
    });
    const fullChannel = fullChannelEntity.toJSON();

    res.status(200).json(fullChannel);
  } catch (error) {
    res.status(400);
    console.error(error);
    throw new Error(error.message);
  }

});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const channelUserEntities = await ChannelUser.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Channel,
          include: [
            {
              model: User,
              as: 'users',
              through: ChannelUser,
              attributes: { exclude: ['password'] },
            },
            {
              model: User,
              as: 'groupAdmin',
              attributes: { exclude: ['password'] },
            },
          ],
        },
        // {
        //   model: User,
        //   include: [
        //     {
        //       model: User,
        //       as: 'users',
        //       through: ChannelUser,
        //       attributes: { exclude: ['password'] },
        //     },
        //   ],
        // },
      ],
    });
    const channels = channelUserEntities.map(c => c.Channel.toJSON());
    // console.log('fetchChat channels:', JSON.stringify(channels));

    // const channelEntities = await Channel.findAll({
    //   include: [
    //     {
    //       model: User,
    //       as: 'users',
    //       through: ChannelUser,
    //       attributes: { exclude: ['password'] },
    //       where: { id: req.user.id }
    //     },
    //   ],
    // });
    // const channels = channelEntities.map(c => c.toJSON());
    // console.log('fetchChat channels:', channels);

    // const user = userEntity.toJSON();
    // console.log('fetchChat result:', user);
    res.status(200).send(channels);
  } catch (error) {
    res.status(400);
    console.error(error);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 1) {
    return res
      .status(400)
      .send("2 or more users (including you) are required to form a group chat");
  }

  users.push(req.user.id);

  try {
    const channel = await Channel.create({
      chatName: req.body.name,
      // users: users,
      isGroupChat: true,
      adminId: req.user.id,
    });

    // console.log('createGroupChat created channel ID:', channel.id);
    
    // channelUsers = users.map(usrId => ({
    //   channelId: channel.id,
    //   userId: usrId,
    // }));
    // console.log('createGroupChat channelUsers:', channelUsers);

    await channel.setUsers(users);

    const fullChannelEntity = await Channel.findByPk(channel.id, {
      include: [
        {
          model: User,
          as: 'users',
          through: ChannelUser,
          attributes: { exclude: ['password'] },
        },
        {
          model: User,
          as: 'admin',
          attributes: { exclude: ['password'] },
        }
      ],
    });
    const fullChannel = fullChannelEntity.toJSON();

    // console.log('createGroupChat fullChannel:', fullChannel);
    res.status(200).json(fullChannel);
  } catch (error) {
    res.status(400);
    console.error(error)
    throw new Error(error.message);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId: channelId, userId } = req.body;

  // check if the requester is admin

  await ChannelUser.destroy({
    where: { channelId, userId },
  });

  const channelEntity = await Channel.findByPk(channelId, {
    include: [
      {
        model: User,
        as: 'users',
        through: ChannelUser,
        attributes: { exclude: ['password'] },
      },
    ],
  });

  if (channelEntity.users && channelEntity.users.length <= 1) {
    await Channel.destroy({
      where: { id: channelId },
    });
  }
  res.status(200).end();

  // if (!removed) {
  //   res.status(404);
  //   throw new Error("Chat Not Found");
  // } else {
  //   // res.json(removed);
  //   res.end();
  // }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
};