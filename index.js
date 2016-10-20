var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
// var http = require('http')
var requestify = require('requestify'); 
var algoliasearch = require('algoliasearch');
var client = algoliasearch('AM0SLP1KG5', '2275715c4c9af53ae3d8e3ecb0358d4a');


// var options = {
//     host: 'api.ipinfodb.com',
//     path: 'v3/ip-city/?key=57a270e806c9470043d95781a3fcef13a6b86fa75c05ffd6908308d0dd1e4143&ip=74.125.45.100&format=json'
// }


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Let us locate some ip adresses >:)')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'secret') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

 var cart_items = []
 var messageTrack = false
 var forecast = false
 var location = ""
 var place
 //var intent
 var query
 var firstName = ""
 var firstTime = true
 var genderSpecific = false
 var gender = ""
 var sender
 var breakDownSearch = false
 var d = new Date();
 var n = d.getDay(); 





app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging

    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id


        var URL = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,gender&access_token=EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"
                     requestify.get(URL).then(function(response) {
                        // Get the response body
                        var rep = response.getBody();
                        firstName = rep.first_name
                        gender = rep.gender

            });
        

        if (event.message && event.message.text) {
            text = event.message.text
            //generate string to make http request..
	        var urlTestText = text
            for(i = 0; i < urlTestText.length; i++) {
                if(text[i] == " ") {
                   urlTestText = urlTestText.replaceAt(i,"+")
                }
            }

            var witURL = "https://api.wit.ai/message?v=20161019&q=" + urlTestText + "&access_token=P3FOKDQK5E3MKIPS7OH6ZBJ6DYCPSAQN"
            

            requestify.get(witURL).then(function(response) {
                    // Get the response body
                    var rep = response.getBody();
                    //sendTextMessage(sender, rep.entities.length)
                    if(Object.keys(rep.entities).length > 0) {

                        if("intent" in rep.entities) {
                            intent = rep.entities.intent[0].value
                            console.log(intent)
                            //sendTextMessage(sender,"this is the intent.. " + intent)
                        }
                        if(intent == "greeting") {
                            sendTextMessage(sender, "Hey there " + firstName + "!")
                        }
                        else if(intent == "weather") {
                            console.log("someone is searching for weather..")
                            if(!("location" in rep.entities)) {
                                sendTextMessage(sender, "where exactly?")
                                
                            }
                            else { 
                            var location = rep.entities.location[0].value
                            weather(sender, location)
                            }

                        }
                        else if(intent == "rainy") {
                            if(!("location" in rep.entities)) {
                                sendTextMessage(sender, "where exactly?")
                            }
                            else {
                            var location = rep.entities.location[0].value
                            rainy(sender, location)
                         }

                        }
                        else if(intent == "Sunny") {
                            if(!("location" in rep.entities)) {
                                sendTextMessage(sender, "where exactly?")
                            }
                            else {
                            var location = rep.entities.location[0].value
                            sunny(sender, location)
                            }

                        }
                        else if(intent == "forecast") {
                            if(!("location" in rep.entities)) {
                                sendTextMessage(sender, "where exactly?")
                            }
                            else {
                            var location = rep.entities.location[0].value
                            var forecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + location + "&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial&cnt=5"    
                             requestify.get(forecastURL).then(function(response) {
                                // Get the response bodyz
                                var forecastRep = response.getBody();
                                forecastBuilder(sender, forecastRep)
                            });
                            }
                        }
                        else {
                            sendTextMessage(sender, "I'm sorry. I didn't understand your message. I am curretly only programmed to find weather. Try something like \"Is is sunny in Miami?\"")
                        }

                       
                    }
                
                   
            }); 

        }
        
    }
    res.sendStatus(200)
});


// var token = "EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"

var token = "EAANGyeqRbP4BAO5yNNPoSBaQvStEjPWSG9RdMbmooOych5dP8DkwrED7wdfgxYZC9IOu0PrtcrmCAkUgEyY9C8WjWzP2dEJo6PEiMCrRhwlEfkIgrZAuonY58iYDgnuki4e3KVwZAtylqOebAwkhCZBjwNEUb0TeZBjZADg2aCGwZDZD"

function forecastBuilder(sender, response) {
    var forecastObject = []
    for(i = 0; i < response.list.length; i++) {
        forecastObject.push(response.list[i]);
    }

    sendTextMessage(sender, "Alright, here's your forecast in " + location +  " for the next " + forecastObject.length + " days"); 
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    var d = new Date();
    var n = d.getDay();

    elementTest = [{
        "title": "this is a test",
        "subtitle": "this is another test",
        "image_url": "https://s32.postimg.org/ftphqrki9/rainy.jpg",
    }]



    for(i = 0; i < forecastObject.length; i++) {

    if(n == 6){n = 0;}
    var day = forecastObject[i];
    var description = day.weather[0].description
    var imageUrl = ""

    //image handeling
    if(description.includes("rain")) {
        imageUrl = "https://s32.postimg.org/ftphqrki9/rainy.jpg"
    }
    else if(description.includes("cloud")) {
        imageUrl = "https://s32.postimg.org/imipaskup/cloudy.jpg"
    }
    else {
        imageUrl = "https://s32.postimg.org/9u1qn3zpt/sunny.jpg"
    }

    elementTest.push({
        "title": days[n] + ": " + day.weather[0].description,
        "subtitle": "High: " + day.temp.max + " Low: " + day.temp.min + " Average: " + day.temp.day,
        "image_url": imageUrl
    })
     n++;
    }


    elementTest.shift()

 messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elementTest
            } 
        }
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
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })




}
function weather(sender, location) { 
    var URL = 'http://api.openweathermap.org/data/2.5/weather?q= ' + location + '&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial'

    requestify.get(URL).then(function(response) {
                    // Get the response body

        var rep = response.getBody();


        var respText = "The weather in " + rep.name + " is " + rep.main.temp + " degrees fahrenheit" 

        sendTextMessage(sender, respText)   

    }); 


}
function rainy(sender, location) {

 var URL = 'http://api.openweathermap.org/data/2.5/weather?q= ' + location + '&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial'

    requestify.get(URL).then(function(response) {
                    // Get the response body

        var rep = response.getBody();

        //sendTextMessage(sender, rep.weather[0].description)    
        var weatherDescription = rep.weather[0].main

        if(weatherDescription == "Rain" || weatherDescription.includes('rain')) {
            sendTextMessage(sender, "Yes! its raining in " + rep.name)
            //sendTextMessage(sender, "Yes")
        }
        else{
            if(weatherDescription[weatherDescription.length - 1] == 's') {
                sendTextMessage(sender, "Nope. Looks like there are " + weatherDescription.toLowerCase())

            }
            else { 
            sendTextMessage(sender, "Nope. Looks like it is " + weatherDescription.toLowerCase())
            }

        }    

    }); 


}
function sunny(sender, location) {
    var URL = 'http://api.openweathermap.org/data/2.5/weather?q= ' + location + '&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial'

    requestify.get(URL).then(function(response) {
                    // Get the response body

        var rep = response.getBody();

        //sendTextMessage(sender, rep.weather[0].description)    
        var weatherDescription = rep.weather[0].main

        if(weatherDescription =='Clear') {
            sendTextMessage(sender, "Yes, the sun is out.. shining with a temperature of " + rep.main.temp + " in " + rep.name)
            //sendTextMessage(sender, "Yes")
        }
        else{
            if(weatherDescription[weatherDescription.length - 1] == 's') {
                sendTextMessage(sender, "Nope. Looks like there are " + weatherDescription.toLowerCase())

            }
            else { 
            sendTextMessage(sender, "Nope. Looks like it is " + weatherDescription.toLowerCase())
            }
        }    

    }); 


}


function sendTextMessage(sender, text) {
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
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}





String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

