var express = require('express');
var app = express();

// this sets a static directory for the views
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  // use sendFile to render the index page
  res.sendFile('index.html');
});

app.listen(3000, function() {
  console.log("You're listening to the smooth sounds of port 3000 in the morning");
});