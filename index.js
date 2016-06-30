var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot..Lets do this!')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'parrotBot') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


app.get('/test', function(req,res) {



  
//     var response = JSON.parse(xhr.responseText);

    res.send("hello!")
})





// API End Point - added by Stefan

//API IP 

 app.post('/webhook', function (req, res) {

    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
      event = req.body.entry[0].messaging[i];

      if (event.postback){
        if(event.postback.payload === 'MEETING_RSVP'){
          new Promise(actions.getProfileInfo.bind(this,senderID))
            .then(userInfo => {
              console.log('they rsvp\'d and we got their info, lets send a message back to:');
              console.log(userInfo.profile.first_name);
              actions.sendTextMessage(
                userInfo.id,
                `Thanks ${userInfo.profile.first_name}. We look forward to seeing you on Friday!`
              ) ;
          })
        }
        if(event.postback.payload === 'USER_DEFINED_PAYLOAD'){
          actions.sendTextMessage(senderID, 'please give us a time. Example formats. 1 pm 2:15 am');
        }
      }

      senderID = event.sender.id;

      if (event.message && event.message.text) {

        messageText = event.message.text.toLowerCase();
        console.log('\n\n-----MESSAGE RECEIVED-----\n');
        new Promise(actions.getProfileInfo.bind(this,senderID)).then( user => {
          console.log(`\nfrom: ${user.profile.first_name}\n`);
          console.log(`\nmsg: ${messageText}\n`);
          console.log('------------------\n');
        })

        if(messageText === 'profile'){
         getProfileInfo(senderID);
        }

        if (messageText === 'what are my options'){
         sendButtons(senderID);
          break;
        }

        if (messageText === 'generic'){
          sendGenericMessage(senderID);
        }

        if(messageText === 'next meeting'){
          sendTextMessage(
            senderID,
            'The business Club\'s next meeting is May 6th from 12:00 to 1:00pm.'
          );
          setTimeout(actions.sendButtons.bind(this,senderID),3000);
          // actions.sendButtons(senderID);
        }
      }
    }
    res.sendStatus(200);
  });

var token = "EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"

module.exports = {
  setWelcomeScreen: function(){
    request({
      url: `https://graph.facebook.com/v2.6/${PAGE_ID}/thread_settings?access_token=${token}`,
      method: 'POST',
      qs: {
        'setting_type': 'call_to_actions',
        'thread_state': 'new_thread',
        'call_to_actions': [
          {
            'message': {
              'text': 'Welcome to the Miramar Business Club\'s Page! Send us a message to learn more about what we do.'
            }
          }
        ]
      }
    }, function(err, response, body){
      if (err) console.log(err);
      console.log('got a resonse, after setting welcome message');
      console.log(JSON.stringify(body));
    })
  },
  sendTextMessage: function (sender, text) {
    messageData = {
      text:text
    }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }
    }, function(error, response, body) {

      console.log('messeage should be sent');

      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  },
  sendButtons: function (sender) {
    var message = {
      'attachment': {
        'type':'template',
        'payload':{
          'template_type': 'button',
          'text': 'See what we have planned',
          'buttons': [
            {
              'type': 'web_url',
              'title': 'View Agenda',
              'url': 'https://docs.google.com/a/miramarsd.net/viewer?a=v&pid=sites&srcid=bWlyYW1hcnNkLm5ldHxidXNpbmVzc2NsdWJ8Z3g6NGQwZDZlNDdmNjQ3YmI2Ng'
            },
            {
              'type': 'postback',
              'title': 'RSVP',
              'payload': 'MEETING_RSVP'
            }
          ]
        }
      }
    }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: message,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  },
  getProfileInfo: function(sender, resolve, reject){
    request({
      url: 'https://graph.facebook.com/v2.6/'+sender+'?fields=first_name,last_name,profile_pic',
      qs: {access_token:token},
      method: 'GET',
    }, function(err, response, body){
      if (err) console.log(err);
      const profile = JSON.parse(body);
      resolve({id: sender, profile: profile});
    }.bind(this));
  },
  sendGenericMessage: function(sender) {
    messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "First card",
            "subtitle": "Element #1 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
            "buttons": [{
              "type": "web_url",
              "url": "https://www.messenger.com/",
              "title": "Web url"
            }, {
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for first element in a generic bubble",
            }],
          },{
            "title": "Second card",
            "subtitle": "Element #2 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
            "buttons": [{
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for second element in a generic bubble",
            }],
          }]
        }
      }
    };
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  }
}

