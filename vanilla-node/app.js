var express = require("express");
var logfmt = require("logfmt");

var app = express();

app.use(express.bodyParser());
app.use(logfmt.requestLogger());

var sys = require('sys')

function execute(cmd){
  child = exec(cmd,function (error, stdout, stderr) {
    sys.print('stdout: ' + stdout);
    sys.print('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

app.get('/', function(req, res) {
  res.send("This App can help you log on the stdout: GET on /log?msg=something")
});

app.get('/log', function(req, res) {
  var msg = req.param('msg');
    sys.print(msg);
  res.send('stdout: ' + msg)


});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
