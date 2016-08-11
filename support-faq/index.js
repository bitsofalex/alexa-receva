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
    function(request, response) {
        if(request.slot('POST_TYPE').value == 'International')
            response.say('forty dollars').send();
        if(request.slot('POST_TYPE').value == 'Local')
            response.say('twenty dollars').send();
        return false;
    }
);

module.exports = skill;