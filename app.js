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
});
var bot = new builder.UniversalBot(connector);
server.post('https://qnaapp1.azurewebsites.net/api/messages', connector.listen());
 
// Root dialog, triggers search and process its results
bot.dialog('/', [
    function (session) {
        // Trigger Search
        session.beginDialog('searchqna1:/');
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
var azureSearchClient = AzureSearch.create('searchqna1', '1EA0B804219EEC0AEF8A4FF113A3461B', 'qna-index');
 
/// <reference path="../SearchDialogLibrary/index.d.ts" />
var SearchDialogLibrary = require('SearchDialogLibrary');
 
// RealState Search
var searchqna1ResultsMapper = SearchDialogLibrary.defaultResultsMapper(searchqna1ToSearchHit);
var searchqna1 = SearchDialogLibrary.create('searchqna1', {
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