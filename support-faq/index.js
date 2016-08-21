'use strict';
module.change_code = 1;

//START OF MODULES
var Alexa = require('alexa-app');
var firebase = require('firebase');
var requestPromise = require('request-promise');
var skill = new Alexa.app('post')
//END OF MODULES

//START OF INITIALISING db
var db;
var addressesRef;
function initialiseFirebase(){
    firebase.initializeApp({
        serviceAccount: {
            projectId: "receva-courier-app-9c866",
            clientEmail: "lambda@receva-courier-app-9c866.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCECGd33ukqFAA8\nZs+Q9Hfa4c+k+7MCAFB0wG9gNQKLNeJRwmq8fK8ClyBpspj4U8JnN/kPa9PT92k5\nma4cfAp1qd6nQyeIdAXNchBOcDqdYnz1gvXuOHBfARU2c2c5RZrunCjCpEINjI+T\n+9Txh3C23hRiTZFtovmwB9UffVXlBAqZuGQyGEif9+JoQVgVDc30hCFORoOD7MEP\njZvK881fXiQo/wVg8IH1QFSMhtfJtJtvG5s/Z0g5bk+VYJ0/sTqU32VL2TMANfWM\nlGipvvNKEBV4bi/PYj+fcaaU9tMBGGTZSIS+TXaJmsw0d1Aq8Dp7JwY0pzYUtRJK\n2XbWH6LLAgMBAAECggEASm2yZhBywBWmTGZoe/5T0j+ZHhgFQQuMT0RrhIBdfrxR\naGWAZeCjh4JJ80uKj/InlKgo7liKgOLnnmDTlZsXCl1H9mIU1wcQfk/egVkisbXj\nW0MH/9IxBl1F5/wGJHLoc7n0AEU4NwsVpQZBdCY1k+B8/S1c3cERn/nKWoX89awK\n9Zjs3UsjItVDMdpv6ZvJ2vfiHvUZGKjRggGCn2CZmUetaOyKN4WZcFpElwFoSXt7\n6Iwe3WNaeUBAoqCZ8TFhY6/ktozWImagFYttamz8w/RV3NmBoMdlwqR2QYgpqv6n\nTHXBmYNkCOH1pAkqXtY4KXSQki/O8iTxuravqptAgQKBgQDvnIoBi7pK05mZSDkC\nrzQt2ypPTv3LRa/NWO4ZSc+cPkBTmQasLJF30+nQuzRfVL+ZaIKlKUkiTBtSm35X\nt5i1t4WF56MljWIsYLpFm8I14JvGIQgY4ONNGnU0UzR2BtDzCM9gNBEaWEovJjrl\n3NAqytqRWX5C+jKBYlXxupkh/QKBgQCNEDlYL1j/ztwxWXrZv8u+GR34a/99RopE\n6AzoKqPaP9GZrWSJS1Kdi/g9oLgkyPiEttNzFRrEftKke0LdFES9CndqtgXYylOa\nMFFpv9zCZQMLCXYQwzGgErf6QOIa/OHfDj+dSHR6Q62IgMYEP7U+ltI1K211sgsF\nUxzkjt2uZwKBgQDKcI1ApRbt5TzefmB8Xh5Np99lRi2ysdvIOJxhjTT0oruiZaV3\njegRP19KVP/4kxeVuvC2Ld12NqrW7jyeS6Wf0b/j1ELIlV0edVKrQN+iuXOiv4Gh\n0073c6UWYj3uge/Dhev/Mb5JbdKvZzNXxWmy3dQv/VZprA1Dtxs5shdy2QKBgDIx\nPqZBGqLS4QhyNUM7emxmlYJqMxtJOTOxeb42Rd0HbjYHO0ma0oeaYTbUdBEqrTrT\nrsM5FDAsjBjYfv8ZEihNjBYdNFFiFIM9hApjqVJGDOIleKwYOBUj8/CIm6tMpbXv\nZPU67a7/W8TBRTQH0x61HZCrpiQFuOQpIZO1ve0rAoGBAIDziXiJMzuJelX8Ua7E\nuToJh0DO/SMtjQkJb6ZHsdmCwo6Kg+K2FXTwn1sRGcODTgh+yypgMVgqatVH1vOG\nuPjgRNOcWJCO4xjkn0v5sBkJ5zgkeViUJ57Abn/VyNz1MXP8puicP+rMquAXRo+4\nMgtiasuNSyJHZG9t7sDxNMg/\n-----END PRIVATE KEY-----\n"
        },
        databaseURL: "https://receva-courier-app-9c866.firebaseio.com"
    });
    db = firebase.database();
    addressesRef = db.ref('/Addresses');
}
//END OF INITIALISING DB

//START OF ENDPOINT DATA
// Set the URL for the Domestic Parcel Calculation service
var HTTP_API_KEY = "483b58b5-b634-4fa3-abb8-78191b7afaa1";
var HTTP_PREFIX= 'digitalapi.auspost.com.au';

var validationlist = {
            '1234':'Ryan',
            '5678':'Sue',
            '8910':'Ryan'
}
var firebaseusers = {
            '1234':'12345',
            '5678':'32345',
            '8910':'12345'
}


//END OF ENDPOINTS



//START OF INTENTS 

//launch event
skill.launch(function(request, res) {
    //SET DEFAULTS
    res.session('POST_SPEED','REGULAR');
    if (!res.session('POST_HOME'))
    res.session('POST_HOME',3000);
    
    //PERFORM PROMPTS
    var prompt = "Let's work out how much postage is. Say 'set' followed by your postcode.";
    res.say(prompt).reprompt(prompt).shouldEndSession(false);

    //INITIALISE DATABASE
    initialiseFirebase();
});

//method for storing postcode
skill.intent('setPostCodeIntent', 
    //pass slots and utterances first
    {
        'slots': {
        'SET_POST_CODE': 'AMAZON.FOUR_DIGIT_NUMBER'
        },
        'utterances': ['{|save}{|postcode|post code}{SET_POST_CODE}{postcode|post code}']
    },
    function(req,res){
        var postcode = req.slot('SET_POST_CODE');
        res.session('POST_HOME',postcode.toString());
        res.say(postcode.toString() + " is saved. What kind of parcel are you sending?").shouldEndSession(false);
    }
);

//method for calculating postage
skill.intent('SupportIntent', {
        'slots': {
            'POST_TYPE': 'POST_TYPE',
            'POST_TARGET' :'AMAZON.FOUR_DIGIT_NUMBER',
            'POST_SPEED' : 'POST_SPEED'
        },
        'utterances': ['{|cost|much} {POST_TYPE} {|POST_SPEED} {|POST_TARGET} {|cost}']
    },
    function(req, res) {
        if(req.slot('POST_TYPE') == 'international')
            res.say('forty dollars').shouldEndSession(false);

        //call AUSPOST API for local postage
        if(req.slot('POST_TYPE') == 'local' || req.slot('POST_TYPE') == 'domestic')
        {   
            //IF USER SPECIFIED A TARGET POSTCODE
            if (req.slot('POST_TARGET'))
            {
                res.session('POST_TARGET',req.slot('POST_TARGET'));
                
                //Set post speed (regular or express). If not given, default to regular.
                if(req.slot('POST_SPEED'))
                    res.session('POST_SPEED',req.slot('POST_SPEED').toUpperCase());
                if(!res.session('POST_HOME'))
                    res.session('POST_HOME',3000);

                var POST_TARGET = res.session('POST_TARGET').toString();
                var POST_HOME = res.session('POST_HOME').toString();
                var POST_SPEED = res.session('POST_SPEED').toString();
                
                //build the query using the current session postcode
                var HTTP_SAMPLE_QUERY = "length=22&width=16&height=7.7&weight=1.5&from_postcode="+POST_HOME+"&to_postcode="+ POST_TARGET +"&service_code=AUS_PARCEL_" + POST_SPEED;
                var HTTP_RATE = 'https://' + HTTP_PREFIX + '/postage/parcel/domestic/calculate.json?' + HTTP_SAMPLE_QUERY;    

                //set the HTTP GET OPTIONS and parse to JSON
                var options = {
                    method: 'GET',
                    uri: HTTP_RATE,
                    headers: {
                        'AUTH-KEY': HTTP_API_KEY
                    },
                    json: true // Automatically parses the JSON string in the response 
                };

                //send GET request to AUSPOST post calculator API
                requestPromise(options)
                .then(function (api) {
                    if (api)
                    //save the POST_TARGET_COST for later use
                    res.session('POST_TARGET_COST',api.postage_result.total_cost);
                    //need to add .send() for asynchronous operations. You can use Alexa while waiting for the HTTP response.
                    res.say(POST_SPEED + " post parcel is " + api.postage_result.total_cost + " dollars. ").shouldEndSession(false).send();
                }).catch(function (err) {
                    res.say("Error in connecting to Australia Post.").shouldEndSession(false).send();
                })
            }

            //IF USER DIDNT SPECIFY A TARGET POSTCODE BUT WE HAVE A PREVIOUS QUERY
            else if (res.session('POST_TARGET')) res.say(res.session('POST_SPEED').toString() +" post parcel to post code "+res.session('POST_TARGET').toString()+" is " + res.session('POST_TARGET_COST').toString()+" dollars.").shouldEndSession(false).send();
            
            //IF USER DIDNT SPECIFY A TARGET POSTCODE AND HAVE NO PREVIOUS QUERIES
            else res.say('The price of a 500 gram domestic regular parcel is 8.25 dollars. Tell me the kind of parcel and then add the post code after so I can give you a more accurate price.').shouldEndSession(false).send();
        
            //IMPORTANT! - NEED THIS SO ALEXA WAITS FOR THE HTTP REQUEST
            return false;
        }

    }
);

//method for getting postcode - called last in the schema!
skill.intent('getPostCodeIntent',
    {
        'utterances': ['{|my} {post|postcode}']
    },
    function(req , res){
            if(res.session('POST_HOME'))
                res.say(res.session('POST_HOME').toString()).shouldEndSession(false);
            else
                res.say("I don't have your postcode. Tell me what your postcode is.").shouldEndSession(false);
    }
);

//method for LINKING TO MY POST TO GET ACCOUNT DETAILS
skill.intent('linkReceva', 
    //pass slots and utterances first
    {
        'slots': {
            'POST_LINK_NUMBER': 'AMAZON.FOUR_DIGIT_NUMBER'
        },
        'utterances': ['Link to my post using {POST_LINK_NUMBER}']
    },
    function(req,res){

        //replace this with RECEVA set endpoint
        var postlinknumber = req.slot('POST_LINK_NUMBER').toString();
        //save the mypost account details
        if (validationlist[postlinknumber])
        {
            res.session('POST_LINK_NUMBER',postlinknumber);
            res.say("Hi "+validationlist[postlinknumber]+". You've successfully linked your mypost account.").shouldEndSession(false);
        }else{
            res.say("Sorry I don't recognise that number. Try again.").shouldEndSession(false);
        }
    }
);

//method for setting a message to Receva
skill.intent('setReceva', 
    //pass slots and utterances first
    {
        'slots': {
        'POST_MESSAGE': 'AMAZON.LITERAL'
        },
        'utterances': ['{give|set|tell} {|the postman|postman} {|message|know} {sample|POST_MESSAGE} using LITERAL']
    },
    function(req,res){
        if (res.session('POST_LINK_NUMBER'))
        {
            //replace this with RECEVA set endpoint
            var postmessage = req.slot('POST_MESSAGE');
            res.session('POST_MESSAGE',postmessage.toString()); 

            //send to firebase
            firebase.database().ref('Addresses/'+firebaseusers[res.session('POST_LINK_NUMBER')]).update({
                deliveryInstructions: postmessage
            });
            
            res.say("You've left the following message for the postman. "+postmessage).shouldEndSession(false).send();
        }
        else 
        res.say("You need to link your my post account first. Go to the my post website and generate a link code.").shouldEndSession(false).send();
         
        return false;
    }
);

//method for getting a message for Receva
skill.intent('getReceva', 
    //pass slots and utterances first
    {
        'utterances': ['{get|repeat|play|tell} {|postman|message}']
    },
    function(req,res){

        if (res.session('POST_LINK_NUMBER'))
        {
            //replace this with RECEVA get endpoint
            var postmessage = res.session('POST_MESSAGE');
            if (postmessage)
                res.say("You've left the following message for the postman. "+postmessage).shouldEndSession(false);
            else
                res.say("You didn't leave a message for the postman. Say 'tell the postman' and then leave your message to leave some drop-off instructions for the postman." ).shouldEndSession(false);
        }
        else 
        res.say("You need to link your my post account first. Go to the my post website and generate a link code.").shouldEndSession(false);
    }
);

//method for getting a message for the Postman
skill.intent('close', 
    //pass slots and utterances first
    {
        'utterances': ['{close|stop}']
    },
    function(req,res){
        res.say("See you later!").shouldEndSession(true);
    }
);

//method for changing firebase -> addresses
//Addresses -> name: 12345, 32345
//Addresses -> deliveryInstructions
//Login -> raye.magp@gmail.com
//Pass -> auspost
//Login -> sue.hogg@auspost.com.au
//Pass -> auspost

//Resecure call script for call

//RECEVA 


//END OF INTENTS

module.exports = skill;

