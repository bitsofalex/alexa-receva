'use strict';
module.change_code = 1;

//START OF MODULES
var Alexa = require('alexa-app');
var requestPromise = require('request-promise');
var skill = new Alexa.app('post');
//END OF MODULES



//START OF ENDPOINT DATA
// Set the URL for the Domestic Parcel Calculation service
var HTTP_API_KEY = "483b58b5-b634-4fa3-abb8-78191b7afaa1";
var HTTP_PREFIX= 'digitalapi.auspost.com.au';

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
                requestPromise(options).catch(function (err) {
                    res.say("Error in connecting to Australia Post.").shouldEndSession(false).send();
                })
                .then(function (api) {
                    if (api)
                    //save the POST_TARGET_COST for later use
                    res.session('POST_TARGET_COST',api.postage_result.total_cost);
                    //need to add .send() for asynchronous skills. You can use Alexa while waiting for the HTTP response.
                    res.say(POST_SPEED + " post parcel is " + api.postage_result.total_cost + " dollars. ").shouldEndSession(false).send();
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
        var validationlist = {
            '1234':'Ryan',
            '5678':'Sue'
        }

        //save the mypost account details
        if (validationlist[postlinknumber])
        {
            res.session('POST_LINK_NUMBER',validationlist[postlinknumber]);
            res.say("Hi "+validationlist[postlinknumber]+". You've successfully linked your mypost account.").shouldEndSession(false);
        }else{
            res.say("Sorry I don't recognise that number. Try again.").shouldEndSession(false);
        }
    }
);

//method for setting a message for the Postman
skill.intent('setReceva', 
    //pass slots and utterances first
    {
        'slots': {
        'POST_MESSAGE': 'AMAZON.LITERAL'
        },
        'utterances': ['{give|set|tell} {|the postman|postman} {|message|know} {sample|POST_MESSAGE} using LITERAL']
    },
    function(req,res){

        //replace this with RECEVA set endpoint
        var postmessage = req.slot('POST_MESSAGE');

        res.session('POST_MESSAGE',postmessage.toString());
        res.say("You've left the following message for the postman. "+postmessage).shouldEndSession(false);
    }
);

//method for getting a message for the Postman
skill.intent('getReceva', 
    //pass slots and utterances first
    {
        'utterances': ['{get|repeat|play|tell} {|postman|message}']
    },
    function(req,res){
        //replace this with RECEVA get endpoint
        var postmessage = res.session('POST_MESSAGE');

        if (postmessage)
            res.say("You've left the following message for the postman. "+postmessage).shouldEndSession(false);
        else
            res.say("You didn't leave a message for the postman. Say 'tell the postman' and then leave your message to leave some drop-off instructions for the postman." ).shouldEndSession(false);
    }
);


//END OF INTENTS

module.exports = skill;