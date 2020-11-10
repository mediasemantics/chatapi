# Media Semantics Chatbot API Reference Implementation
Sample chatbot using the Chatbot API

## Overview
This is the Reference Implementation for the [Media Semantics Chatbot API](https://aws.amazon.com/marketplace/pp/B088HFTD41), a cloud-based API available on the Amazon AWS Marketplace.

For a detailed introduction to the Chatbot API, please read the [Chatbot API Tutorial](https://www.mediasemantics.com/apitutorial4.html). 

You can see the Reference Implementation running [here](https://mediasemantics.com/chatapiclient.html) (Plain HTML) and [here](https://mediasemantics.com/webapp) (React).

## Requirements
This README assumes that you are able to view html pages using a local web server (i.e. using a url that begins with http://localhost) and that you are able to run Node.js. If you prefer, you can also install it directly on a web server. Please see this [tutorial](https://www.mediasemantics.com/apitutorial2.html) for tips on setting up an AWS EC2 instance using Apache and Node.js.

## Obtaining keys
Use this [AWS Markeplace](https://aws.amazon.com/marketplace/pp/B088HFTD41) page to add the Chatbot service to your AWS account. You will receive codes by email that you will insert in the server.js file. You will be charged $0.001 per call to the 'reply' endpoint. There are no monthly minimums. Charges will appear on your monthly AWS bill.

## Installation

### Server
Install the sample, e.g. in the home directory:
```
cd ~  
git clone https://github.com/mediasemantics/chatapi.git  
cd chatapi
```

Install the required dependencies:
```
npm update
```

Create a conversations subdirectory:
```
mkdir conversations
```

Modify the server.js file to add your Chatbot API access credentials.
```
nano server.js
```
Replace 'xxxxxxxx' with the 8 digit key that was mailed to you when you signed up for Chatbot API.

Save your changes.

You can now start the server with:
```
node server.js
```
You should see "Listening on port 3000".

You can verify that the caching server app is working by viewing this URL from a web browser:
```
http://localhost:3000/reply&userid=123&input=hello
```
You should see an answer.

### Plain HTML Client

Load html/chatapiclient.html into a web browser using an http://localhost url. You must run the page using a local server - the sample will not run using a file url.

### React Client

The webapp directory contains a sample React application that provides a more elegant chat interface. To build it,
```
cd webapp
npm update
npm start
```

## Going Further

Please see the [Chatbot API Tutorial](https://www.mediasemantics.com/apitutorial4.html) for a more detailed description of the Chatbot API and the Chatbot API Reference Implementation.




