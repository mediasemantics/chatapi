var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');

// TODO set up your Chatbot API key here
var chatAPIKey = "xxxxxxxx";

// TODO - set up your own Mind and place the Mind Id (see http://www.mediasemantics.com/apitutorial4.html)
var mindid = "xxxxxxx";

// TODO set the path to your cache directory, and make sure to give it read/write permission, e.g. mkdir conversations && sudo chgrp apache conversations && sudo chmod g+w conversations
var cachePrefix = "./conversations/";

// Set up express
var app = express();
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

// The Chatbot API endpoint
var urlReply = "http://api.mediasemantics.com/reply";


app.get('/reply', function(req, res, next) {
    console.log("reply");
    if (!req.query.userid) throw new Error("missing userid");
    if (!req.query.input) throw new Error("missing input");
    
    // Load the data for this user from disk, if available
    let filename = cachePrefix + req.query.userid + '.json';
    fs.readFile(filename, "utf8", function(err, raw) {
        let data;
        let control;
        
        // No data available - treat as a new user
        if (err) {  
            data = {};
            control = "[new]";
        }
        // Conversation data is available for this user
        else {  
            data = JSON.parse(raw);
            // Also read last-modify time
            let stats = fs.statSync(filename);
            let lastModified = new Date(stats.mtime);
            // Calculate minutes since last input/output
            let elapsedMinutes = Math.floor((new Date() - lastModified) / 60000);
            // Add some context when there are long breaks in the conversation
            if (elapsedMinutes > 5)
                control = "[return " + elapsedMinutes + "]";
        }
        
        // autostart is translated to [new], [return], or [nav]
        if (req.query.input == "[autostart]") {
            if (control) {
                req.query.input = control;
            }
            else {
                req.query.input = "[nav]";
            }
        }
        
        // Now send the user input
        let params = {
            key:chatAPIKey,
            input:req.query.input,
            data:JSON.stringify(data),
            mindid:mindid
        }
        request.post({url:urlReply, form:params}, function (err, httpResponse, body) {            
            if (err) return next(err);
            else if (httpResponse.statusCode != 200) return next(new Error("chat error "+body))
            let ret = JSON.parse(body);
            
            // Write the data back again
            fs.writeFile(filename, JSON.stringify(ret.data), function(err) {
                if (err) return next(err);
                // Return the response
                res.statusCode = 200;
                if ((req.get("Origin")||"").indexOf("localhost") != -1) res.setHeader('Access-Control-Allow-Origin', req.get("Origin"));
                // TODO: adjust your domain for CORS protection
                //else if ((req.get("Origin")||"").indexOf("yourdomain.com") != -1) res.setHeader('Access-Control-Allow-Origin', req.get("Origin"));*/
                res.setHeader('content-type', 'application/json');
                res.write(JSON.stringify({output:ret.output, idle:ret.idle}));
                res.end();
            });
        });
    });
});

 
app.listen(3000, function() {
  console.log('Listening on port 3000');
});
