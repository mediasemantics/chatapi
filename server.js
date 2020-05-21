var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');

// TODO set up your Chartbot API key here
var chatAPIKey = "xxxxxxxx";

// TODO - this is a sample rulebase - change to your own rulebase
var rulebaseURL = "http://s3-us-west-2.amazonaws.com/samples.mediasemantics.com/sample-5-6-20.json";

// TODO set the path to your cache directory, and make sure to give it read/write permission, e.g. mkdir conversations && sudo chgrp apache conversations && sudo chmod g+w conversations
var cachePrefix = "./conversations/";

// Set up express
var app = express();
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

// The Chatbot API endpoint
var urlReply = "http://mediasemantics.com/reply";


app.get('/reply', function(req, res, next) {
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
            control = "[start]";
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
                control = "[restart " + elapsedMinutes + "]";
        }
        
        // If we have synthesized a [start] or [restart n] event, send that first, ignore the output.
        sendControlIfNecessary(control, data, req, res, next, function(data) {
            
            // Now send the user input (or [auto])
            let params = {
                key:chatAPIKey,
                input:req.query.input,
                data:JSON.stringify(data),
                url:rulebaseURL
            }
            request.post({url:urlReply, form:params}, function (err, httpResponse, body) {            
                if (err) return next(err);
                else if (httpResponse.statusCode != 200) return next(new Error("chat error"))
                let ret = JSON.parse(body);
                
                // Write the data back again
                fs.writeFile(filename, JSON.stringify(ret.data), function(err) {
                    if (err) return next(err);
                    
                    // Return the response
                    res.statusCode = 200;
                    if ((req.get("Origin")||"").indexOf("localhost") != -1) res.setHeader('Access-Control-Allow-Origin', req.get("Origin"));
                    // TODO: adjust your domain for CORS protection
                    // if ((req.get("Origin")||"").indexOf("yourdomain") != -1) res.setHeader('Access-Control-Allow-Origin', req.get("Origin"));
                    res.setHeader('content-type', 'application/json');
                    res.write(JSON.stringify({output:ret.output, idle:ret.idle}));
                    res.end();
                });
            });
        });
    });
});


// If control is defined, then sends a control input, then calls the callback with the new data. 
// Otherwise, calls the callback with the existing data.
function sendControlIfNecessary(control, data, req, res, next, callback) {
    if (!control) return callback(data);
    let params = {
        key:chatAPIKey,
        input:control,
        data:JSON.stringify(data),
        url:rulebaseURL
    }
    request.post({url:urlReply, form:params}, function (err, httpResponse, body) {            
        if (err) return next(err);
        else if (httpResponse.statusCode != 200) return next(new Error("chat error"))
        let ret = JSON.parse(body);
        callback(ret.data);
    });
}
        
app.listen(3000, function() {
  console.log('Listening on port 3000');
});
