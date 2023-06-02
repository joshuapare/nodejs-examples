import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize('db', 'user', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3366,
  logging: false,
});

export const Book = sequelize.define("books", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  release_date: {
    type: DataTypes.DATEONLY,
  },
  subject: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}