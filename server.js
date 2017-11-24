var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.get('/', function(req, res){
  res.send('Todo API root');
});

app.listen(PORT, function(){
   console.log("Express listening on the port " + PORT);
})
