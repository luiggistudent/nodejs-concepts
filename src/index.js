const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = function(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  !user ? response.status(404).json({ error: "User not found" }) : false;
  
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);
  userExists ? response.status(400).json({ error: "User already exists" }) : false;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find(todo => todo.id === id);
  !todo ? response.status(404).json({ error: "Todo not found" }) : false;
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);
  !todo ? response.status(404).json({ error: "Todo not found" }) : false;
  todo.done = true;
  response.status(202).json(todo);
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.findIndex(todo => todo.id === id);
  if (todo === -1) return response.status(404).json({ error: "Todo not found" });
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;