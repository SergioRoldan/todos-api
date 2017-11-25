var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 8080;

var todoNextId = 1;
var todos = [];


app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('Todo API root');
});

app.get('/todos', function(req, res) {
  var queryParameters = req.query;
  var filteredTodos = todos;

  if (queryParameters.hasOwnProperty('completed') && queryParameters.completed === 'true') {
      filteredTodos = _.where(filteredTodos, {completed: true});
  } else if (queryParameters.hasOwnProperty('completed') && queryParameters.completed === 'false') {
      filteredTodos = _.where(filteredTodos, {completed: false});
  }

  if (queryParameters.hasOwnProperty('q') && queryParameters.q.trim().length > 0) {
      filteredTodos = _.filter(filteredTodos, function(todo) {
          return todo.description.toLowerCase().indexOf(queryParameters.q.toLowerCase()) > -1;
      });
  }


  res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then(function(todo) {
    if(!!todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });
  //var matchedTodo = _.findWhere(todos, {id: todoId});

  //if (matchedTodo) {
  //  res.json(matchedTodo);
  //}
  //else {
  //  res.status(404).send();
  //}
});

app.post('/todos', function(req, res){
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function(todo) {
    res.json(todo.toJSON());
  }, function(e) {
    res.status(400).json(e);
  });

  /*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.description = body.description.trim();

  body.id = todoNextId++;
  todos.push(body);

  res.json(body);*/
});

app.post('/todos/delete', function(req, res){

  var body = _.pick(req.body, 'ids');
  var ids = body.ids;

  if(ids.length === 0) {
    return res.status(400).send();
  } else if(_.isNumber(ids)) {
    var aux = ids;
    ids = [];
    ids.push(aux);
  }

  var matchedTodos= [];

  for(var i=0 ; i<ids.length; i++) {
    var todoId = parseInt(ids[i], 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    if (matchedTodo) {
      matchedTodos.push(matchedTodo);
    }
  }

  if(matchedTodos.length === 0) {
    return res.status(404).json({"error": "No todo found with that ids"});
  }

  for(var i=0 ; i<matchedTodos.length; i++) {
    todos = _.without(todos, matchedTodos[i]);
  }

  res.json(todos);
});

app.post('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if(!matchedTodo) {
    return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAttributes.completed = body.completed;
  } else if(body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAttributes.description = body.description;
  } else if(body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function(){
     console.log("Express listening on the port " + PORT);
  });
});
