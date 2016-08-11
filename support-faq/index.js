'use strict';
module.change_code = 1;

//START OF MODULES
var Alexa = require('alexa-app');
var requestPromise = require('request-promise');
var skill = new Alexa.app('post');
//END OF MODULES



//START OF ENDPOINTS

//Sample query
var HOME = 3000;
var TARGET = 2000;
var HTTP_SAMPLE_QUERY = "length=22&width=16&height=7.7&weight=1.5&from_postcode="+HOME+"&to_postcode="+TARGET+"&service_code=AUS_PARCEL_REGULAR";

// Set the URL for the Domestic Parcel Calculation service
var HTTP_API_KEY = "483b58b5-b634-4fa3-abb8-78191b7afaa1";
var HTTP_PREFIX= 'digitalapi.auspost.com.au';
var HTTP_RATE = 'https://' + HTTP_PREFIX + '/postage/parcel/domestic/calculate.json?' + HTTP_SAMPLE_QUERY;

//END OF ENDPOINTS


//START OF INTENTS 

//launch event
skill.launch(function(request, response) {
    if (response.session('postcode')){
        var prompt = 'Tell me what kind of package you want to send.';
        response.say(prompt).reprompt(prompt).shouldEndSession(false);
    }
    else
    {
        var prompt = 'Tell me what your postcode is.';
        response.say(prompt).reprompt(prompt).shouldEndSession(false);
    }
    
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
        res.session('postcode',postcode.toString());
        //cannot chain session with say
        res.say(postcode.toString() + " is saved.").shouldEndSession(false);
    }
);

//method for calculating postage
skill.intent('SupportIntent', {
        'slots': {
        'POST_TYPE': 'POST_TYPE'
        },
        'utterances': ['{|cost} {POST_TYPE} {|cost}']
    },
    function(req, res) {
        
        var jsondata;
        
        if(req.slot('POST_TYPE') == 'international')
            res.say('forty dollars');

        //call AUSPOST API for local postage
        if(req.slot('POST_TYPE') == 'local')
        {   
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
                res.say("Error in connecting to Australia Post.").send().shouldEndSession(false);
            })
            .then(function (api) {
                if (api)

                //need to add .send() for asynchronous skills. You can use Alexa while waiting for the HTTP response.
                res.say("The total cost is " + api.postage_result.total_cost).send().shouldEndSession(false);
            })
            
            //IMPORTANT! - NEED THIS SO ALEXA WAITS FOR THE HTTP REQUEST
            return false;
        }
    }
);

//method for getting postcode - called last in the schema!
skill.intent('getPostCodeIntent',
    function(req , res){
            if(res.session('postcode'))
                res.say(res.session('postcode').toString()).shouldEndSession(false);
            else
                res.say("I don't have your postcode. Tell me what your postcode is.").shouldEndSession(false);
    }
);

//END OF INTENTS

module.exports = skill;