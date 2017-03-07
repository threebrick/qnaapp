var util = require('util');
var _ = require('lodash');
var builder = require('botbuilder');
var restify = require('restify');
 
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
 
// Create chat bot
var connector = new builder.ChatConnector({
    appId: '9df91066-6576-42b9-a9c9-4365c6b349da',
    appPassword: 'cUUU9vRcPiozuS1kn9CBasx'
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('https://qnaapp2.azurewebsites.net/api/messages', connector.listen());
//server.post('/api/messages', connector.listen());

 
// Root dialog, triggers search and process its results
//bot.dialog('/', [
//    function (session) {
        // Trigger Search
//        session.beginDialog('searchqna2:/');
//    },
//    function (session, args) {
        // Process selected search results
//        session.send(
//            'Done! For future reference, you selected these properties: %s',
//            args.selection.map(i => i.key).join(', '));
//    }
//]);

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================

// Root dialog, triggers search and process its results
bot.dialog('/', [
    function (session) {
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("ServiceNow Bot")
           // .text("Your bots - wherever your users are talking.")
            .images([
                 builder.CardImage.create(session, "http://www.blocally.com/bots/ey/techsupport/ey_logo.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi... I'm the ServiceNow Bot. I can help  you create service tickets, review open tickets and answer your FAQs.");
        session.beginDialog('/menu');
    },
    //function (session, results) {
        // Display menu
    //    session.beginDialog('/menu');
    //},
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "How may I help you today?", "create ticket|review tickets|faqs|(quit)");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

// Create a service tickets flow

bot.dialog('/create ticket', [
    function (session) {

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Are you submitting this request for another user?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "newticket", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "ticketforme", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
]);
bot.beginDialogAction('create ticket', '/create ticket'); 

bot.dialog('/newticket', [
    function (session) {
        session.send("We will now help you create a ticket. Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "Please enter your full name.");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        session.userData.fullname = results.response;
        builder.Prompts.text(session, "Where are you located?");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        session.userData.location = results.response;
        builder.Prompts.text(session, "What is your question or issue?");
    },
    
    function (session, results) {
//        builder.Prompts.choice(session, "What demo would you like to run?", "ticket|prompts|picture|cards|list|carousel|receipt|actions|(quit)");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");
        session.userData.question = results.response;

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to upload a screen shot of your issue to complete your ticket?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "sendattachment", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "receipt", null, "No")
                    ])
            ]);
        
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('newticket', '/newticket');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/ticketforme', [
    function (session) {

        session.userData.fullname = "Darnell Clayton";
        session.userData.location = "Alpharetta, GA."
        session.send("Got it Darnell.");
        builder.Prompts.text(session, "What is your question or issue?");
    },
        
    
    function (session, results) {

        session.userData.question = results.response;

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to upload a screen shot of your issue to complete your ticket?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "sendattachment", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "receipt", null, "No")
                    ])
            ]);
        
     //   session.send(msg);
        session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('ticketforme', '/ticketforme');   // <-- no 'matches' option means this can only be triggered by a button.

bot.dialog('/sendattachment', [
    
    function (session, results) {
    //    session.send("Attachments");
        builder.Prompts.attachment(session, "You may upload your screen shot when you are ready.");
    },
    function (session, results) {
        var msg = new builder.Message(session)
            .ntext("I got %d attachment.", "I got %d attachments.", results.response.length);
        results.response.forEach(function (attachment) {
            msg.addAttachment(attachment);    
        });
        session.endDialog(msg);
    },

    function (session, results) {
        // Display menu
        session.beginDialog('/receipt');
    }
]);
bot.beginDialogAction('sendattachment', '/sendattachment');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/receipt', [
    function (session) {
  //      session.send("You can send a receipts for purchased good with both images and without...");
        
        // Send a receipt with images
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("ServiceNow Ticket")
                    .items([
                   //     builder.ReceiptItem.create(session, "$22.00", "Screen shot").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg"))
                   //     builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        builder.Fact.create(session, "SR1234567898", "Ticket Number"),
                        builder.Fact.create(session, "" + session.userData.fullname + "", "Requestor's Name"),
                        builder.Fact.create(session, "1-470-211-2222", "Contact Number"),
                        builder.Fact.create(session, "" + session.userData.location + "", "Location"),
                        builder.Fact.create(session, "" + session.userData.question + "", "Question/Issue")
                    ])
                  //  .tax("$4.40")
                  //  .total("$48.40")
            ]);
        session.send(msg);
        session.beginDialog('/ticketsubmit');

        
        
    },

    

    
]);

bot.beginDialogAction('receipt', '/receipt');   // <-- no 'matches' option means this can only be triggered by a button.



bot.dialog('/ticketsubmit', [
    
    
    function (session) {
//        builder.Prompts.choice(session, "What demo would you like to run?", "ticket|prompts|picture|cards|list|carousel|receipt|actions|(quit)");
//		builder.Prompts.choice(session, "How may I help you?", "ticket|cards|carousel|receipt|actions|(quit)");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    
                    .text("Would you like to submit this ticket now?")
                    
                    .buttons([
                        builder.CardAction.dialogAction(session, "ticketcomplete", null, "Yes"),
                        
                        builder.CardAction.dialogAction(session, "receipt", null, "No")
                    ])
            ]);
        session.send(msg);
        //session.endDialog(msg);
    }
    
]);
bot.beginDialogAction('ticketsubmit', '/ticketsubmit');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/ticketcomplete', [
    function (session) {
        session.endDialog("Your ticket has been submitted.  One of our technicians will contact you soon.");
        
    }
    
]);
bot.beginDialogAction('ticketcomplete', '/ticketcomplete');   // <-- no 'matches' option means this can only be triggered by a button.


bot.dialog('/review tickets', [
    function (session) {
        session.send("We found 3 open tickets.  Please select from the options below:");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Ticket #: SR1234567898")
                    .text("Lorem ipsum dolor sit amet, consectetur adpiscing elit...")
                    
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "More Details")
                        
                    ]),
                new builder.HeroCard(session)
                    .title("Ticket #: SR2234567898")
                    .text("Lorem ipsum dolor sit amet, consectetur adpiscing elit...")
                    
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market", "More Details")
                        
                    ]),
                new builder.HeroCard(session)
                    .title("Ticket #: SR3234567898")
                    .text("Lorem ipsum dolor sit amet, consectetur adpiscing elit...")
                    
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/EMP_Museum", "More Details")
                        
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
    }    
]);

bot.beginDialogAction('review tickets', '/review tickets');   // <-- no 'matches' option means this can only be triggered by a button.



bot.dialog('/faqs', [
    function (session) {
        // Trigger Search
        session.beginDialog('searchqna2:/');
    },
    function (session, args) {
        // Process selected search results
        session.send(
            'Done! For future reference, you selected these properties: %s',
            args.selection.map(i => i.key).join(', '));
    }
]);
 
// Azure Search provider
var AzureSearch = require('SearchProviders/azure-search');
//var azureSearchClient = AzureSearch.create('searchqna2', '1EA0B804219EEC0AEF8A4FF113A3461B', 'qna-index');
var azureSearchClient = AzureSearch.create('searchqna2', '3771FE62C21D964C86D9B4832A1B5D9B', 'qna-index');
 
/// <reference path="../SearchDialogLibrary/index.d.ts" />
var SearchDialogLibrary = require('SearchDialogLibrary');
 
// RealState Search
var searchqna1ResultsMapper = SearchDialogLibrary.defaultResultsMapper(searchqna1ToSearchHit);
var searchqna1 = SearchDialogLibrary.create('searchqna2', {
    multipleSelection: true,
    search: (query) => azureSearchClient.search(query).then(searchqna1ResultsMapper),
    refiners: ['category'],
    refineFormatter: (refiners) =>
        _.zipObject(
            refiners.map(r => 'By ' + _.capitalize(r)),
            refiners)
});
 
bot.library(searchqna1);
 
// Maps the AzureSearch RealState Document into a SearchHit that the Search Library can use
function searchqna1ToSearchHit(searchqna1) {
    return {
        key: searchqna1.id,
        title: util.format('Question - %s.',
            searchqna1.question),
        description: searchqna1.answer
        //,
        //imageUrl: realstate.thumbnail
    };
}

server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));