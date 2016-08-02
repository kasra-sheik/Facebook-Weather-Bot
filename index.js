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
 var firstTime = true
 var genderSpecific = false
 var gender = ""
 var sender
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

            console.log(text)
            if(text == "start") {
                greetingText = "Hello, Welcome to the Mavatar TestBot. Where you can instantly shop for retail clothes, create and share trendy carts, and find the best possible deals on your favorite items! How would you like to start out today?"
                showOptions(sender, greetingText)
            }
            else if(text.includes("cart") || text == "My Carts") { 
               // sendTextMessage(sender, "Which Cart did you want to view?")
                showCart(sender)
                continue
            }
            // else if(text == "Featured Carts") {
            //     //sendTextMessage(sender, "Summer is here and its time to get up to date with the latest summer trends! Check some of these carts out.")
            //     console.log("cart view")
            //     var cartIds = [49659, 14452,14181]
            //     //showFeaturedCarts(sender, cartIds)
            //     continue 

            // }
            else if(text == "Shop") {
                if(firstTime) {
                    setSearchPreferences(sender)
                    firstTime = false
                }
                else { 
                    sendTextMessage(sender, "Browse through our entire inventory of retail items. Start with something like \"show me a black dress\" to get started.")
                }
                continue
            }
            else if(text == "Sure") {
                genderSpecific = true
                sendTextMessage(sender, "Cool, Browse through our entire inventory of retail items. Start with something like \"show me a black dress\" to get started.")
                continue
            }
            else if(text == "No Thanks") {
                genderSpecific = false
                sendTextMessage(sender, "Cool, Browse through our entire inventory of retail items. Start with something like \"show me a black dress\" to get started.")
                continue
            }
            else if(text == "log in") {
                generateLogin(sender)
            }

            // if(text.includes("most expensive item")) {
            //     console.log("quick! we got a rich dude!")
            //     sendTextMessage(sender, "One with such expensive taste is someone I would love to get to know. Hello gorgeous. I am the Mavatar BOT")
            //     var index = client.initIndex('CatalogProductInfo_by_price_desc');
            //     index.search(" ", {
            //                     hitsPerPage: 10
            //                 }, function searchDone(err, content) {
            //                   if (err) {
            //                     console.error(err);
            //                     return;
            //                   }
            //                     if(content.hits.length > 0) {
            //                         mavatarItemGenerator(sender, content, " ", 0)
            //                     }
            //                     else { 
            //                         sendTextMessage(sender, "I'm sorry I couldn't find what you were looking for.. try broadening your search.")
            //                     }

            //                 });
            //     continue



            // }
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
                        console.log("query: " + query)

                        if("intent" in rep.entities) {
                            intent = rep.entities.intent[0].value
                            //sendTextMessage(sender,"this is the intent.. " + intent)
                        }
                        if("wit_greeting" in rep.entities) { 
                            sendTextMessage(sender, "Hello " + firstName + ", welcome to Mavatar")    
                        }
                        else if(intent == "Shop" || intent == "less" || intent == "greater") {
                            if("wit_item" in rep.entities && !("amount_of_money" in rep.entities)){
                                var item = ""
                                if(genderSpecific) {
                                    item = rep.entities.wit_item[0].value + " " + gender
                                    query = rep.entities.wit_item[0].value
                                }
                                else {
                                    item = rep.entities.wit_item[0].value
                                    query = rep.entities.wit_item[0].value

                                }
                                var index = client.initIndex('CatalogProductInfo');
                                


                            index.search(item, {
                                hitsPerPage: 10
                            }, function searchDone(err, content) {
                              if (err) {
                                console.error(err);
                                return;
                              }
                                if(content.hits.length > 0) {
                                    if(someOneElse){sendTextMessage(sender, "I think I found some items your " + thatSomeOneElse + "will like!")}
                                    sendTextMessage(sender, "I think I found some items you might like..")
                                    mavatarItemGenerator(sender, content, item, 0)
                                }
                                else { 
                                    sendTextMessage(sender, "I'm sorry I couldn't find what you were looking for.. try broadening your search.")
                                }

                            });

                            }
                            else if(intent == "Shop" && !("wit_item" in rep.entities)) {
                                if(query != undefined) {
                                    var item = query
                                    var thatSomeOneElse
                                    var someOneElse = false
                                    if(rep._text.includes("for my"))  {
                                        someOneElse = true
                                        var indexNum = rep._text.indexOf("for my")
                                        thatSomeOneElse = rep._text.substring(indexNum + 6, 200)
                                        item += thatSomeOneElse
                                    }
                                    var index = client.initIndex('CatalogProductInfo');
                                


                                index.search(item, {
                                    hitsPerPage: 10
                                }, function searchDone(err, content) {
                                  if (err) {
                                    console.error(err);
                                    return;
                                  }
                                    if(content.hits.length > 0) {
                                        if(someOneElse){sendTextMessage(sender, "I think I found some items your " + thatSomeOneElse + "will like!")}
                                        mavatarItemGenerator(sender, content, item, 0)
                                    }
                                    else { 
                                        sendTextMessage(sender, "I'm sorry I couldn't find what you were looking for.. try broadening your search.")
                                    }

                                });



                                }
                                else {
                                     sendTextMessage(sender, "what exactly were you looking for..?")
                                }


                            }
                            else if("amount_of_money" in rep.entities) {
                                //sendTextMessage(sender, "we are here..")
                                var item = ""
                                if("wit_item" in rep.entities) {
                                    item = rep.entities.wit_item[0].value + " " + gender
                                    query = item 
                                }
                                else {
                                    //sendTextMessage(sender, "this is where we crash..?") 
                                    item = query
                                    //item += (" " + gender)
                                    //hello
                                    //fuck
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
                                console.log("filter: " + numericFilter)
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
                    else {
                        showOptions(sender, "I'm not sure I understand what you're trying to say. These are somethings I can help you with..")
                    }
                   
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
                console.log("slihdbfldsb: " + postback_text)
                //sendTextMessage(sender, postback_text)
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
                    var cartId = postback_text.substring(7,200)
                    showCartItems(sender, cartId)
                }
                else if(postback_text == "\"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP\"") {
                    showOptions(sender, "What can I do for you today?")
                }
               

            }
           

        
    }
    res.sendStatus(200)
})

var token = "EAANGyeqRbP4BAL4qOjj2EgeiTCEEoNDg8OeuykOmTnHZC8P2VpEmVMKpAvCVLxF50p7ZARtahrYbMcvV14oH2VIOQDk5srjgQlQxKbEsZArbUZCZCUBkKaZA2IReylaHxY2Av0Be2exmqfjcZAo7RJZAdroNg1SAOsCceomp0y8pJgZDZD"

if(n==6){
    if(sender != null) {
        sendTextMessage(sender, "here's an update for ya")
    }
}
function setSearchPreferences(sender) {
   messageData = {

        "text": "I see that you are a " + gender + ". Do you want me to set your search preferences to only show items for " + gender + "s? You can change this at anytime just by changing your preferences in the help menu.",
        "quick_replies": [{
            "content_type": "text",
            "title": "Sure",
            "payload": "does this matter?"
            },

            {
            "content_type": "text",
            "title": "No Thanks",
            "payload": "doubt it "
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

function showFeaturedCarts(sender, cartIds) {
    cart = [{
        "title": "test",
        "subtitle": "also a test",
        "image_url": "One More Test"

    }]
    var jsonArray
    for(i = 0; i < cartIds.length; i++) {
        console.log(cartIds[i])
        var URL = "https://api-dev.mavatar.com/api/carts/" + cartIds[i] + "/items?"
        console.log(URL)
        requestify.get(URL).then(function(response) {
            var rep = response.getBody();
            jsonArray.push(rep)

            console.log("HERE: " + rep.items[0].cart.image_url )
            FeaturedCart = {
                "title": rep.items[0].cart.name,
                "subtitle": "nill",
                "image_url": rep.items[0].cart.image_url 
                //

            }
            console.log("pushing..")
            cart.push(FeaturedCart) 
        });
        break
    }
    console.log(jsonArray.length)
    cart.shift()
    console.log("PENAUT " + cart.length)
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": cart
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
                        "url": "https://mavatar.com/login"
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
function showCartItems(sender, cartId) {
    var URL = "https://api-dev.mavatar.com/api/carts/" + cartId + "/items?mav_user_api_key=MTs1QroCztjKygPrTk"

    requestify.get(URL).then(function(response) {
        var rep = response.getBody();

         
        elementTest = [{
            "title": "test",
            "subtitle": "shitty test",
            "image_url": "fake Image"

        }]

         for(i = 0; i < rep.items.length; i++) {
            var cartItem = rep.items[i]
            element = {
                "title": cartItem.short_description,
                "subtitle": cartItem.long_description,
                "image_url": cartItem.vendor_image_url
            }
            elementTest.push(element)
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


    });





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
            "payload": "paylooooad"
        }
        cartButtons.push(testButton)
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
                        "title": "Which Cart did you Want to View?",
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
function mavatarItemGenerator(sender, response, query, pageNum) { 
    var itemObjects = []
    console.log("HERE BITCH: " + query)
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
function showOptions(sender, greetingText) {
  messageData = {

        "text": greetingText,
        "quick_replies": [{
            "content_type": "text",
            "title": "Shop",
            "payload": "shop_payload"
            },

            {
            "content_type": "text",
            "title": "My Carts",
            "payload": "my_cart_payload"
            },
            {
            "content_type": "text",
            "title": "Featured Carts",
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





String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

