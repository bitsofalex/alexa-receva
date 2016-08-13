/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Space Geek for a space fact"
 *  Alexa: "Here's your space fact: ..."
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var https = require('https');

var urlPrefix = "https://digitalapi-stest.npe.auspost.com.au/track/v3/search?q=44P7635456010821";

/**
 * SpaceGeek is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var ParcelTracker = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ParcelTracker.prototype = Object.create(AlexaSkill.prototype);
ParcelTracker.prototype.constructor = ParcelTracker;

ParcelTracker.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

ParcelTracker.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleNewFactRequest(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
ParcelTracker.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

ParcelTracker.prototype.intentHandlers = {
    "GetParcelTrackingIntent": function (intent, session, response) {
        handleNewFactRequest(intent, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say tell me a space fact, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleNewFactRequest(intent, response) {
    getTrackingDetails(function (trackingDetails) {
        // var trackingId = intent.slots.a.value + intent.slots.b.value + intent.slots.c.value + intent.slots.d.value;
        var speechOutput = "You have " + trackingDetails.QueryTrackEventsResponse.TrackingResults[0].Consignment.Articles.length +
            " parcel. Your parcel is " +trackingDetails.QueryTrackEventsResponse.TrackingResults[0].Consignment.Articles[0].Status +
            ". It is currently at " + trackingDetails.QueryTrackEventsResponse.TrackingResults[0].Consignment.Articles[0].Events[0].Location;
            // ". And your I.D. is " + trackingId;
        var cardTitle = "Your parcel";

        // todo create response
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    });
}

function getTrackingDetails(eventCallback) {
    var url = urlPrefix;

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var trackingDetails = JSON.parse(body);
            eventCallback(trackingDetails);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SpaceGeek skill.
    var fact = new ParcelTracker();
    fact.execute(event, context);
};
