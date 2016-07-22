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
 //var intent
 var query
 var firstName = ""

// API End Point - added by Stefan

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        var URL = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"
                 requestify.get(URL).then(function(response) {
                    // Get the response body
                    var rep = response.getBody();
                    firstName = rep.first_name

                });


        if (event.message && event.message.text) {
            text = event.message.text
            if(text == "start") {
                sendTextMessage(sender, "Welcome to Mavatar. Before we get started, I'd like to see if you have an account with us so you can view your carts and pay from facebook. Do you have an account with us?")
                generateLogin(sender)
                continue
            }
            if(text == "cart") { 
               // sendTextMessage(sender, "Which Cart did you want to view?")
                showCart(sender)
            }
            var urlTestText = text
            for(i = 0; i < urlTestText.length; i++) {

                if(text[i] == " ") {
                   urlTestText = urlTestText.replaceAt(i,"+")
                }
            }
          var witURL = "https://api.wit.ai/message?v=20160707&q=" + urlTestText + "&access_token=I64J6VXZKMXLQESP5S67JNIIKHOIXT25"
            

               requestify.get(witURL).then(function(response) {
                    // Get the response body
                    var rep = response.getBody();
                    //sendTextMessage(sender, rep.entities.length)
                   

                    if(Object.keys(rep.entities).length > 0) {

                        if("intent" in rep.entities) {
                            intent = rep.entities.intent[0].value
                            //sendTextMessage(sender,"this is the intent.. " + intent)
                        }

                        if(intent == "Shop" || intent == "less" || intent == "greater") {
                            if("wit_item" in rep.entities && !("amount_of_money" in rep.entities)){
                                var item = rep.entities.wit_item[0].value
                                query = item
                                var index = client.initIndex('CatalogProductInfo');
                             
                            index.search(item, {
                                hitsPerPage: 10
                            }, function searchDone(err, content) {
                              if (err) {
                                console.error(err);
                                return;
                              }
                                if(content.hits.length > 0) {
                                    mavatarItemGenerator(sender, content, item, 0)
                                }
                                else { 
                                    sendTextMessage(sender, "I'm sorry I couldn't find what you were looking for.. try broadening your search.")
                                }

                            });

                            }
                            else if("amount_of_money" in rep.entities) {
                                //sendTextMessage(sender, "we are here..")
                                var item = ""
                                if("wit_item" in rep.entities) {
                                    item = rep.entities.wit_item[0].value
                                    query = item 
                                }
                                else {
                                    sendTextMessage(sender, "this is where we crash..?") 
                                    item = query
                                }

                                sendTextMessage(sender, item)
                                var index = client.initIndex('CatalogProductInfo');

                                // sendTextMessage(sender, "Some one is a picky searcher")
                                var lessThan = true 
                                var moneyAmount = rep.entities.amount_of_money[0].value
                                if(rep.entities.intent.length > 1) {
                                    if(rep.entities.intent[1].value == "greater") {
                                        lessThan = false
                                    }
                                }
                                else {
                                    if(rep.entities.intent[0].value == "greater") {
                                        lessThan = false
                                    }

                                }
                                if(lessThan == true){inequality = "<"}
                                else if(lessThan == false){inequality = ">"}
                                var numericFilter = "retail_price " + inequality + " " + moneyAmount.toString()
                                 index.search(item, {
                                    hitsPerPage: 10,
                                    "numericFilters": [numericFilter] 

                                }, function searchDone(err, content) {
                                  if (err) {
                                    console.error(err);
                                    sendTextMessage(sender, "error!")
                                    return;
                                  }
                                if(content.hits.length > 0) {
                                    mavatarItemGenerator(sender, content, item, 0)
                                }
                                else { 
                                    sendTextMessage(sender, "I'm sorry I couldn't find what you were looking for.. try broadening your search.")
                                }                               

                                });


                            }
                            else if(intent == "inventory") {
                                sendTextMessage(sender, "we seem to be here..")
                                var item = ""
                                if("wit_item" in rep.entities) {
                                    item = rep.entities.wit_item[0].value
                                    query = item 
                                    var index = client.initIndex('CatalogProductInfo');
                                    index.search(item, {
                                hitsPerPage: 10
                                }, function searchDone(err, content) {
                                  if (err) {
                                    console.error(err);
                                    return;
                                  }
                                    if(content.hits.length > 0) {
                                        sendTextMessage(sender, "Yes, Would you like to see some?")
                                        //mavatarItemGenerator(sender, content, item, 0)
                                    }
                                    else { 
                                        sendTextMessage(sender, "Nope, I'm sorry. Type in browse for a detailed list of what we carry")
                                    }

                            });

                                }
                                else { 
                                    sendTextMessage(sender, "what exactly are you looking for?")
                                }
                               
                            }



                        }

                    }
                    // else {
                    //     sendTextMessage(sender, "I'm sorry..I'm not sure I understood what you mean..")
                    // }
                }); 
            if(text.substring(0,6) == "parrot") {
                sendTextMessage(sender, text.substring(7,200))
                continue
            }
           else if(text == 'query' ) {
                sendTextMessage(sender, query)

            }
           else if(text == 'log in') {
                generateLogin(sender)


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
           
        }
            if(event.postback) {
                var postback_text = JSON.stringify(event.postback.payload)
                //sendTextMessage(sender, "info: " + postback_text.substring(1,5) + "item name: " + postback_text.substring(6, 1000)  )
                //sendTextMessage(sender, postback_text)
                //payloads info + name of item, sends a get request to Algolia with the product name and returns info abt it
                if(postback_text.substring(1,5) == "info") {
                    sendTextMessage(sender, "I found more info on this item..")
                    var index = client.initIndex('CatalogProductInfo')
                    var item = postback_text.substring(6,1000)
                      index.search(item, {
                                hitsPerPage: 1
                            }, function searchDone(err, content) {
                              if (err) {
                                console.error(err);
                                return;
                              }
                                sendTextMessage(sender, content.hits[0].descr)
                                sendTextMessage(sender, "It looks like " + content.hits[0].vendor_name + " is selling this for a price of $ " + content.hits[0].retail_price)

                            });


                }
                else if(postback_text.substring(1,5) == "more") {
                    var pageNum = parseInt(postback_text.substring(6,7))
                    var index = client.initIndex('CatalogProductInfo')
                    var item = postback_text.substring(7,1000)
                      index.search(item, {
                                "page": pageNum,
                                hitsPerPage: 10
                            }, function searchDone(err, content) {
                              if (err) {
                                console.error(err);
                                return;
                              }
                               mavatarItemGenerator(sender, content, item, pageNum)
                            });

                }
                else if(postback_text.includes("cartId")) {
                    var cartId = postback_text.substring(7, 200)
                    cartId = cartId.substring(0, cartId.length - 1)
                    showCartItems(sender, cartId)


                }
            }
    }
    res.sendStatus(200)
})

var token = "EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"

function generateLogin(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Welcome to Mavatar",
                    "buttons": [{
                        "type": "account_link",
                        "url": "https://mavatar.com/login?return_to=%2F"
                    },
                    {
                        "type": "postback",
                        "title": "I don't have an account",
                        "payload": "no-account"
                    }

                    ]

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
function showCart(sender) { 
    var URL = "https://api-dev.mavatar.com/api/carts/?mav_user_api_key=MTs1QroCztjKygPrTk"

    requestify.get(URL).then(function(response) {
        // Get the response body
        var carts = []

        var rep = response.getBody();
        for(i = 0; i < rep.items.length; i++) {
            carts.push(rep.items[i].name)
        }
        //"Which Cart did you want to view
        var cartButtons = []
        testButton = {
            "type": "postback",
            "title": "what a shitty test",
            "payload": "tits"
        }
        cartButtons.push(testButton)
        //sendTextMessage(sender, rep.items[0].id)
        for(i = 0; i < carts.length; i++) {
            var button = {
                "type": "postback",
                "title": carts[i],
                "payload": "cartId " + rep.items[i].id
            }
            cartButtons.push(button)

        }
        cartButtons.shift()
        messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements" : [{
                        "title": "Select a Cart?",
                        "buttons": cartButtons

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
    });
}
function showCartItems(sender, id) {
    sendTextMessage(sender, "this is the id.." + id)
    var URL = "https://api-dev.mavatar.com/api/carts/" + id+ "/items?catalog_vendor_ids,catalog_manufacturer_ids&mav_user_api_key=MTs1QroCztjKygPrTk"

    requestify.get(URL).then(function(response) {
        var rep = response.getBody();
        console.log("This is the length: " + rep.items.length)

    elementTest = [{
        "title": "this is a test",
        "subtitle": "this is another test",
        "image_url": "https://s32.postimg.org/ftphqrki9/rainy.jpg"
    }]

    for(i = 0; i < rep.items.length; i++) {
        var item = rep.items[i]
        element = {
            "title": item.name,
            "subtitle": item.short_description,
            "image_url": item.vendor_image_url

        }
        elementTest.push(element)
        //hello!
    }

    });
    elementTest.shift()
    sendTextMessage(sender, elementTest.length)
 
    if(elementTest.length > 0)  {
       console.log(sender, "we got items..")
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
 else {
    var cartName = rep.items[0].cart.name
    sendTextMessage(sender, "I didn't find any items in " + cartName + ". You can add any item I can find for you or view other carts. ")
 }



    }

function mavatarItemGenerator(sender, response, query, pageNum) { 
    var itemObjects = []
     for(i = 0; i < response.hits.length; i++) {
        itemObjects.push(response.hits[i]);
    }

     elementTest = [{
        "title": "this is a test",
        "subtitle": "this is another test",
        "image_url": "https://s32.postimg.org/ftphqrki9/rainy.jpg",
        "buttons": [{
            "type": "postback",
            "title": "More Info",
            "payload": "This is a test"
            }, {
            "type": "postback",
            "title": "Add to Cart",
            "payload": "Add to Cart" 

            }
            ]
    }]
    for(i = 0; i < 10; i++) {
        if(i > itemObjects.length + 1) {
            break
        }
        var item = itemObjects[i]


        if(i == 9) {

               elementTest.push({
                "title": item.name,
                "subtitle": "$" + item.retail_price,
                "image_url": item.image_url,
                 "buttons": [{
                "type": "postback",
                "title": "More Info",
                "payload": "info " + item.name
                }, {
                "type": "postback",
                "title": "Add to Cart",
                "payload": "Add to Cart" 
                },{

                "type":"postback",
                "title": "Show Me More",
                "payload": "more " + (pageNum + 1) + " "  + query

                }
                ]
                })

            break
        }
         elementTest.push({
                "title": item.name,
                "subtitle": "$" + item.retail_price,
                "image_url": item.image_url,
                 "buttons": [{
                "type": "postback",
                "title": "More Info",
                "payload": "info " + item.name
                }, {
                "type": "postback",
                "title": "Add to Cart",
                "payload": "Add to Cart" 
                }
                ]
                })
        }
    //}
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
            "title": "View Carts",
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



String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

