var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 8080;

var todoNextId = 1;
var todos = [];


app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('Todo API root');
});

app.get('/todos', function(req, res) {
  res.json(todos);
});

app.get('/todos/:id', function(req, res){
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  console.log(matchedTodo);

  if (matchedTodo) {
    res.json(matchedTodo);
  }
  else {
    res.status(404).send();
  }
});

app.post('/todos', function(req, res){
  var body = _.pick(req.body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.description = body.description.trim();

  body.id = todoNextId++;
  todos.push(body);

  res.json(body);
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

app.listen(PORT, function(){
   console.log("Express listening on the port " + PORT);
});
