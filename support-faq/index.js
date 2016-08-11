'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
//create new Alexa application
var skill = new Alexa.app('post');

var reprompt = 'Tell me what kind of package you want to send.';

//onLaunch
skill.launch(function(request, response) {
    var prompt = 'Tell me what kind of package you want to send.';
    response.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

//onIntent
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

module.exports = skill;