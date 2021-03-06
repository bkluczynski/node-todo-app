const { ObjectID } = require('mongodb');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userObjectIdOne = new ObjectID();
const userObjectIdTwo = new ObjectID();

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userObjectIdOne,
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userObjectIdTwo,
  },
];

const users = [
  {
    _id: userObjectIdOne,
    email: 'bart@gmail.com',
    password: 'password89',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userObjectIdOne, access: 'auth' }, process.env.JWT_SECRET).toString(),
    }],
  },
  {
    _id: userObjectIdTwo,
    email: 'martin@gmail.com',
    password: 'differentPassword',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userObjectIdTwo, access: 'auth' }, process.env.JWT_SECRET).toString(),
    }],
  },
];

const populateTodos = (done) => {
  Todo.remove({}).then(() =>
    Todo.insertMany(todos)).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const user1 = new User(users[0]).save();
    const user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => done());
};

module.exports = {
  todos, populateTodos, users, populateUsers
};
