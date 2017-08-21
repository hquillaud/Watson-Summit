var express = require("express"),
    app = express();
//var nps=1;
var extend = require('extend');
var port = process.env.PORT || 8080;
var vcapServices = require('vcap_services');
var bodyParser = require('body-parser');
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.listen(port);
console.log("Listening on port ", port);

require("cf-deployment-tracker-client").track();


// The following requires are needed for stt 
var watson = require('watson-developer-cloud');
 
// Configure Speech to text
var sttConfig = extend({version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: 'ab3f38e3-d9e6-49da-aea0-07c4769cbff5',
  password: 'OmXBb8lgTiwQ'
}, vcapServices.getCredentials('speech_to_text'));
var sttAuthService = watson.authorization(sttConfig);
 
// Get Tokens
app.get('/api/sttToken', function(req, res) {
  sttAuthService.getToken({url: sttConfig.url}, function(err, token) {
    if (err) {
      console.log('Error retrieving token: ', err);
      res.status(500).send('Error retrieving token');
      return;
    }
    console.log('stt token generated');
    res.send(token);
  });
});


// Initialize Cloudant connexion 
var Cloudant = require('cloudant');
var cloudant = Cloudant({
      account: 'd0dfe52c-ebc6-4573-a894-232c53a1867b-bluemix',
      key: 'ersenderitysevesevendest',
      password: '884443ab825679d6caf0150dd5e288dafcd5e90a'});
var cdb = cloudant.db.use("sts_database");
var datetime = new Date();
//var cpt=1; 'user'+(cpt+1)

// cette partie n'es pas encore finie, merde mais c ca!

 app.post('/db/record', function(req, res) {
 	console.log(req.body);
   // insert a document in sts_database. 
   	/*cdb.insert({user: req.body.username, 
   		        record1: req.body.record1, 
   		        sentiment1: req.body.sentiment1, 
   		        nps: req.body.nps}, '' , function(err, body, header) {
											      if (err) {
											      	console.log("error");
											        return console.log('[cdb.insert] ', err.message);
											      }
											      console.log("Insertion done!");
    									});*/

    cdb.insert({language: req.body.language, 
                text1: req.body.text1, 
                sentiment1: req.body.sentiment1, 
                score1: req.body.score1, 
                score2: req.body.score2, 
                score3: req.body.score3, 
                text2: req.body.text2, 
                sentiment2: req.body.sentiment2, 
                score4: req.body.score4, 
                score5: req.body.score5, 
                text3: req.body.text3, 
                sentiment3: req.body.sentiment3, 
                score6: req.body.score6}, '' , function(err, body, header) {
                            if (err) {
                              console.log("error");
                              return console.log('[cdb.insert] ', err.message);
                            }
                            console.log("Insertion done!");
                      });
     
});




app.get("/analyze/:text1/:lang", function (req, res) {
 console.log(req.params);
 const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

  const nlu = new NaturalLanguageUnderstandingV1({
    // note: if unspecified here, credentials are pulled from environment properties:
    // NATURAL_LANGUAGE_UNDERSTANDING_USERNAME &  NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD
    username: 'd8346bc8-3413-463b-8a92-9d502b31ee5f',
    password: 's4pqbzmCnjZk',
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2016_01_23
  });

  const options = {
    //"text": "Bad sessions, bad food, this event was a nightmare. IBM Watson is a joke. I will never come to an IBM event ever again.", // Text to analyze
   
    "text": req.params.text1,
    "features": {
      "sentiment": {
        "document": true // Set this to false to hide document-level sentiment results
      },
    },
    "language": req.params.lang
  };

  nlu.analyze(options, function(err, response) {
  	  //var nps_label="";
  	  //nps=Math.round((Math.round(response.sentiment.document.score * 10) + 10)/2);
  	  //nps_label = response.sentiment.document.label;
      //console.log(nps);
      //console.log(nps_label);
      console.log(response);
      if (err) {
      		res.send(err);
      } else {
      	console.log("send back sentiment");
      	res.json(response.sentiment.document.score);
    	}
  });
});

// Configure Speech to text
var ttsConfig = extend(
  {
    version: 'v1',
    url: 'https://stream.watsonplatform.net/text-to-speech/api',
    username: process.env.TTS_USERNAME || '761b7585-0389-4a94-b0d8-a669b18d9d1b',
    password: process.env.TTS_PASSWORD || 'VCCBAdmWpIhB'
  },
  vcapServices.getCredentials('text_to_speech')
);

var ttsAuthService = watson.authorization(ttsConfig);

app.get('/api/ttsToken', function(req, res) {
  ttsAuthService.getToken({ url: ttsConfig.url }, function(err, token) {
    if (err) {
      console.log('Error retrieving token: ', err);
      res.status(500).send('Error retrieving token');
      return;
    }
    res.send(token);
  });
});



