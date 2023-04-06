const asyncHandler = require("express-async-handler");
const { Channel, ChannelUser } = require("../models/channelModel");
const { User } = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Channel.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Channel.create(chatData);
      const FullChat = await Channel.findOne({ id: createdChat.id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const userEntity = await User.findByPk(req.user.id, {
      include: {
        model: Channel,
        through: ChannelUser,
        as: 'channels',
      },
    })

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
            ],
        },
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
    
    channelUsers = users.map(usrId => ({
      channelId: channel.id,
      userId: usrId,
    }));
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

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Channel.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Channel.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Channel.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};