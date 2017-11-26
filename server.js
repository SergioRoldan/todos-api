var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 8080;

var todoNextId = 1;
var todos = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('Todo API root');
});

app.get('/todos', function(req, res) {
  var queryParameters = req.query;
  var where = {};

  if (queryParameters.hasOwnProperty('completed') && queryParameters.completed === 'true') {
      where.completed = true;
  } else if (queryParameters.hasOwnProperty('completed') && queryParameters.completed === 'false') {
      where.completed = false;
  }

  if (queryParameters.hasOwnProperty('q') && queryParameters.q.trim().length > 0) {
      where.description = {
        $like: '%' + queryParameters.q + '%'
      };
  }

  db.todo.findAll({where: where}).then (function(todos) {
    res.json(todos);
  }, function(e) {
    res.status(500).send();
  });

  /*var filteredTodos = todos;

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


  res.json(filteredTodos);*/
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

  console.log(ids);

  if(ids.length === 0 || typeof ids === "undefined") {
    return res.status(400).send();
  } else if(_.isNumber(ids)) {
    var aux = ids;
    ids = [];
    ids.push(aux);
  }

  db.todo.destroy({
    where: {
      id: {
        [db.Sequelize.Op.or]: ids
      }
    }
  }).then(function (rowsDeleted) {
      if(rowsDeleted === 0) {
        res.status(404).json({
          error: 'No todo with id'
        });
      } else {
        res.status(200).json(rowsDeleted);
      }
  }, function() {
    res.status(500).send();
  });

  /*
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

  res.json(todos);*/
});

app.post('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if(body.hasOwnProperty('completed')){
    attributes.completed = body.completed;
  }

  if(body.hasOwnProperty('description')){
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function(todo) {
    if(!!todo) {
      todo.update(attributes).then(function(todo) {
        res.json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function () {
    return res.status(500).send();
  });

});

app.post('/users', function(req, res) {

  var body = _.pick(req.body, 'email', 'password');
  console.log(body);

  db.user.create(body).then(function(user) {
    res.json(user.toPublicJSON());
  }, function(e) {
    res.status(400).json(e);
  });

});

app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function () {
		res.status(401).send();
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});
