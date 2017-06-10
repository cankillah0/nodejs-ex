//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan'),
    url     = require('url'),
    bodyParser = require('body-parser'),
    cors    = require('cors'),
    Approxy = require('./src/approxy');

    
Object.assign = require('object-assign');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));


var whiteList = [
    'http://192.168.1.3:8090',
    'http://192.168.1.2:8090',
    'http://localhost:8090',
    'http://localhost:63342',
    'http://localhost:4200',
    'http://iron6client-test-project-cankillah1.1d35.starter-us-east-1.openshiftapps.com'
];

var corsOpts = {
  origin : function(origin, callback){
    var allowed = whiteList.indexOf(origin) > -1;
    callback(null, allowed);
  }
}
app.use(cors(corsOpts));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '192.168.1.3',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
/*var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};*/

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  /*if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }*/
    res.send('{ place for db initialization }');
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

/*initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});*/

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);


//-------------------------------------------------------------------//

var proxy = new Approxy();

app.post('/init', function(req, res){
    var data = proxy.getInitResponse();
    res.end(JSON.stringify(data));
});

app.post('/spin', function(req, res){
    var data = proxy.getSpinResponse(req.body);
    res.end(JSON.stringify(data));
});

app.get('/', function (req, res) {
    res.end("ok");
});

//-------backoffice services-----//

app.get('/sessions', function(req, res) {
   var promise = proxy.getSessionList();
   promise.then(function(result){
       res.end(JSON.stringify(result));
   })
});

app.get('/data', function (req, res) {
    var promise = proxy.getAllData();
    promise.then(function(result){
        res.end(JSON.stringify(result));
    })
});

module.exports = app ;

