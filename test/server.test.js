const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');
const _ = require('lodash');


const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

const todo = {
  _id: new ObjectID(),
  text: 'Lonely todo',
};

beforeEach(populateTodos);
beforeEach(populateUsers);


describe('POST/todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) { return done(err); }
        return Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not allow to create a todo with invalid data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET/todos', () => {
  it('should get all Todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
  it('should get a single doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('should return 404 if todo was not found', (done) => {
    request(app)
      .get(`/todos/${todo._id.toHexString()}`)
      .expect(404)
      .end(done);
  });
  it('should return 404 for invalid ObjectID', (done) => {
    request(app)
      .get('/todos/invalid_object_id-123-123')
      .expect(404)
      .end(done);
  });
});
describe('DELETE/todos/:id', () => {
  it('should delete a todo', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(todos[0]._id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });
  it('should return 404 if todo was not found', (done) => {
    request(app)
      .delete(`/todos/${todo._id.toHexString()}`)
      .expect(404)
      .end(done);
  });
  it('should return 404 for invalid ObjectID', (done) => {
    request(app)
      .delete('/todos/invalid_object_id-123-123')
      .expect(404)
      .end(done);
  });
});
describe('PATCH/todos/:id', () => {
  it('should change completed to true', (done) => {
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: true, text: 'I like cherries' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('I like cherries');
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });
  it('should change completed to false', (done) => {
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: false, text: 'I like bananas' })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('I like bananas');
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});
