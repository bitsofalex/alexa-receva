'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
//create new Alexa application
var skill = new Alexa.app('post');


//onLaunch
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
        var postcode = req.slots('SET_POST_CODE');
        res.session('postcode',postcode).say(postcode + " is saved.").shouldEndSession(false);
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
        if(req.slot('POST_TYPE') == 'international')
            res.say('forty dollars');
        if(req.slot('POST_TYPE') == 'local')
            res.say('twenty dollars');
    }
);

//method for getting postcode - called last in the schema!
skill.intent('getPostCodeIntent',
    function(req , res){
            if(res.session('postcode'))
                res.say(postcode.toString()).shouldEndSession(false);
            else
                res.say("I don't have your postcode. Tell me what your postcode is.").shouldEndSession(false);
    }
);

module.exports = skill;