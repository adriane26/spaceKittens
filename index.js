var express = require('express');
var app = express();

// this sets a static directory for the views
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  // use sendFile to render the index page
  res.sendFile('index.html');
});

app.listen(process.env.PORT || 3000);