const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'chat',
  'root',
  'mysql',
   {
     host: 'localhost',
     dialect: 'mysql'
   }
);

function connectDB() {
  sequelize.authenticate().then(() => {
    console.log('DB connection has been established successfully.');
  }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });
}

module.exports = {
  connectDB,
  sequelize,
};
