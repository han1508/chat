const { Op } = require('sequelize');
const asyncHandler = require("express-async-handler");
const { User } = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  // const keyword = req.query.search
  //   ? {
  //       $or: [
  //         { name: { $regex: req.query.search, $options: "i" } },
  //         { email: { $regex: req.query.search, $options: "i" } },
  //       ],
  //     }
  //   : {};

  // const users = await User.find(keyword).find({ id: { $ne: req.user.id } });
  const keyword = req.query.search;
  let userEntity;
  if (!String(keyword).trim()) {
    userEntity = await User.findAll();
  } else {
    userEntity = await User.findAll({
      where: {
        name: {
          [Op.like]: `%${keyword}%`
        }
      }
    });
  }
  const users = userEntity
    .map(ent => ent.toJSON())
    .map(usr => {
      usr.id = usr.id;
      delete usr.id;
      return usr;
    })
  // console.log('allUsers users:', users);
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ where: { email } }, {
    attributes: { exclude: ['password'] },
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } }, {
    attributes: { exclude: ['password'] },
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser };