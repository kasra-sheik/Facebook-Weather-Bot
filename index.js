var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
// var http = require('http')
var requestify = require('requestify'); 

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

 var cart_items = []
 var messageTrack = false
 var forecast = false
 var location = ""
 var place
// API End Point - added by Stefan

app.post('/webhook/', function (req, res) {
   

    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id

        if (event.message && event.message.text) {
            text = event.message.text


            if(text.substring(0,6) == "parrot") {
                sendTextMessage(sender, text.substring(7,200))
                continue
            }
            else if(text == 'hi' || text == 'hello' || text == 'hey' || text == 'whats up' || text == 'howdy') {
                var URL = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"
                 requestify.get(URL).then(function(response) {
                    // Get the response body
                    var rep = response.getBody();
                    var repText = "Hello, " + rep.first_name 
                    sendTextMessage(sender, repText)   

                });   
            }
            else if(text.toLowerCase() == 'what is the weather?') {
                sendTextMessage(sender, "Where exactly?")
            }


              else if(text == 'info') {
                //function...

                var URL = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"
                 requestify.get(URL).then(function(response) {
                    // Get the response body
                    var rep = response.getBody();
                    //var repText = "Hello, " + rep.first_name 
                    //sendTextMessage(sender, repText)
                    startInfo(sender, rep.first_name);

                });   



            }
            else if(text.substring(0,2) == 'in' || text.includes("what is the weather in")) {

                if(text.substring(0,2) == 'in') {
                    place = text.substring(3,200)

                }
                else {
                    place = text.substring(22,300)
                }
                var URL = 'http://api.openweathermap.org/data/2.5/weather?q= ' + place + '&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial'



                 requestify.get(URL).then(function(response) {
                    // Get the response body

                    var rep = response.getBody();


                    // if(rep.main.temp > 0) {
                    //     sendTextMessage(sender, "fack")
                    // }
                    var respText = "The weather in " + rep.name + " is " + rep.main.temp + " degrees fahrenheit" 

                    sendTextMessage(sender, respText)   

                });   

            }
            else if(text == "forecast") {

                var URL = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + place + "&APPID=2ddd57c19f8c98af663921918a7507ab&units=imperial&cnt=5"


                 requestify.get(URL).then(function(response) {
                    // Get the response body

                    var rep = response.getBody();
                    //fetching the result and then putting in an array of json objects.
                    // var forecastObject = []
                    // for(i = 0; i < rep.list.length; i++) {
                    //     forecastObject.push(rep.list[i]);
                    // }

                    // sendTextMessage(sender, "okay this is a test" + rep.list[0].weather[0].description)
                    forecastBuilder(sender, rep);


                    // var respText = "The weather in " + rep.name + " is " + rep.main.temp + " degrees fahrenheit" 

                  

                });   
            }

            else if(text.substring(0,2) == 'ip') {
                sendTextMessage(sender,"generating..")

                var ip =text.substring(3,200)
                var URL = 'http://api.ipinfodb.com/v3/ip-city/?key=57a270e806c9470043d95781a3fcef13a6b86fa75c05ffd6908308d0dd1e4143&ip=' + ip + '&format=json'

                requestify.get(URL).then(function(response) {
                    // Get the response body

                    var rep = response.getBody();
                    var repText = "The IP you requested is from " + rep.cityName + ", " + rep.regionName + ", " + rep.zipCode


                    sendTextMessage(sender, repText)   

                });     
                                        }
            else if(text == "img") {
                sendImg(sender)
            }

            else if(text.includes('joke')) {
                sendTextMessage(sender, "no.")

            }
            else if (text.includes('red dress')) {
                sendTextMessage(sender, "Matching you're query for red dresses")
                sendGenericMessage(sender)
            }
            else if(text.includes("my cart")) {
                //we would search and regenerate items?? or grab data from mavatar website

                sendTextMessage(sender, cart_items.length)
            }
            else if(text == "Add to Cart") {
                sendTextMessage(sender, "Great...I added your item ")
            }

            else if(text == 'how are you today?') {
                sendTextMessage(sender, "I'm not bad actually, welcome to mavatar!")
                continue
            }

            else if(text == 'Shop') {

                sendTextMessage(sender,"Browse through mavatar's entire shop platform... try something like \" Show me a Red Dress\" to get started ")
                //sendGenericMessage(sender)

            }
            else if(text == 'checkout') {
                sendImg(sender)
            }
            else if(text.includes('Update')) {

                  sendTextMessage(sender, "I'm glad you've decided shop with us today.. Please enter any required info for your payment.")

                testReceipt(sender)
            }
            else {
                sendTextMessage(sender, "I didn't recognize your request.. search info for some ideas on how to get started")

            }


            //sendTextMessage(sender, "parrot: " + text.substring(0, 200))
        }

         if(event.postback) {
                var postback_text = JSON.stringify(event.postback.payload)

                if(postback_text == "\"Macy's Red Dress\"" || postback_text == "\"Bloomingdale's Red Dress\"" || postback_text == "\"Sak's Fifth Avenue Dress\"" ) {
                    sendTextMessage(sender, "Great! I added " + postback_text + " to your cart. When you're ready to checkout and pay for your order just enter \"checkout\"");
                    cart_items.push("test")
                    sendTextMessage(sender, "this is the size: " + cart_items.length)

                }
                else if(event.postback == "\"cart_payload\"") {


                    sendTextMessage(sender, "One item added to cart...")
                }

            }

        
    }
    res.sendStatus(200)
})

var token = "EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"


function askMessageTrack(sender) {

}
function forecastBuilder(sender, response) {
    var forecastObject = []
    for(i = 0; i < response.list.length; i++) {
        forecastObject.push(response.list[i]);
    }

    sendTextMessage(sender, "Alright, here's your forecast in " + place +  " for the next " + forecastObject.length + " days"); 
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
function startInfo(sender, name) {

    messageData = {

        "text": "Hello " + name + ", Welcome to the Mavatar TestBot. Where you can instantly shop for retail clothes, create and share trendy carts, and find the best possible deals on your favorite items! How would you like to start out today?",
        "quick_replies": [{
            "content_type": "text",
            "title": "Shop",
            "payload": "shop_payload"
            },

            {
            "content_type": "text",
            "title": "View User Carts",
            "payload": "cart_payload"
            },
             {
            "content_type": "text",
            "title": "Hottest Deals",
            "payload": "cart_payload"
            }


            ]
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


function sendImg(sender) {

    messageData = {
        "text":"Would you like me to send you updates on your shipment? (You can change this anytime)",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Update Me",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
      },
      {
        "content_type":"text",
        "title":"Don't Update Me",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      }
    ]
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



// Send an test message back as two cards.


function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Macy's Red Dress",
                    "subtitle": "Slick and Clean",
                    "image_url": "https://s32.postimg.org/4dc1rhfmt/rd1.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://mavatar.com/catalog/product?category_order=0&no=12&order=3&prev_category=852&price_from=1&price_to=8&product_id=2304585",
                        "title": "Open in Browser"
                    }, {
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload":"Macy's Red Dress"
                    },],
                }, {
                    "title": "Bloomingdale's Red Dress",
                    "subtitle": "Smells Like Roses",
                    "image_url": "https://s32.postimg.org/ypwiy4qyd/rd2.jpg",
                    "buttons": [{
                       "type": "web_url",
                        "url": "https://mavatar.com/catalog/product?category_order=0&no=12&order=3&prev_category=852&price_from=1&price_to=8&product_id=2304585",
                        "title": "Open in Browser"
                    },{
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload":"Bloomingdale's Red Dress"
                    }, ],
                },  {
                    "title": "Sak's Fifth Avenue Dress",
                    "subtitle": "Will make you shine! ",
                    "image_url": "https://s32.postimg.org/6fksu5wz9/rd3.jpg",
                    "buttons": [{
                       "type": "web_url",
                        "url": "https://mavatar.com/catalog/product?category_order=0&no=8&order=3&price_from=1&price_to=8&product_id=3870787",
                        "title": "Open in Browser"
                    },{
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload":"Sak's Fifth Avenue Dress"
                    }, ],
                }]  
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

function testReceipt(sender) {
    sendTextMessage(sender, "Here's your order summary..")
    messageData = {
         "attachment":{
      "type":"template",
      "payload":{
        "template_type":"receipt",
        "recipient_name":"Kasra Sheik",
        "order_number":"12345678902",
        "currency":"USD",
        "payment_method":"Visa 3456",        
        "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp":"1428444852", 
        "elements":[
          {
            "title":"Classic White T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":2,
            "price":50,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
          },
          {
            "title":"Classic Gray T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":1,
            "price":25,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
          }
        ],
        "address":{
          "street_1":"GSV LABS",
          "street_2":"",
          "city":"Redwood City",
          "postal_code":"94062",
          "state":"CA",
          "country":"US"
        },
        "summary":{
          "subtotal":75.00,
          "shipping_cost":4.95,
          "total_tax":6.19,
          "total_cost":56.14
        },
        "adjustments":[
          {
            "name":"New Customer Discount",
            "amount":20
          },
          {
            "name":"$10 Off Coupon",
            "amount":10
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

