var express = require('express');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 8080;


var todos = [];

app.get('/', function(req, res){
  res.send('Todo API root');
});

app.get('/todos', function(req, res) {
  res.json(todos);
});

app.get('/todos/:id', function(req, res){
  var todoId = req.params.id;
  var matchedTodo;

  if (matchedTodo)
    res.json(matchedTodo)
  else
    res.status(404).send();
});

app.listen(PORT, function(){
   console.log("Express listening on the port " + PORT);
});
