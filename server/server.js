// Twitter API
var Twitter = Meteor.require("twitter");
var TweetStream = new Meteor.Stream('tweets');
var conf = JSON.parse(Assets.getText('twitter.json'));
var twit = new Twitter({
	consumer_key: conf.consumer.key,
	consumer_secret: conf.consumer.secret,
	access_token_key: conf.access_token.key,
	access_token_secret: conf.access_token.secret
});

twit.stream('statuses/filter', {
	'track': conf.hashtag
}, function(stream) {
	stream.on('data', function(data) {
		TweetStream.emit('tweet', data);
	});
});

// Musixmatch API
var mXm = Meteor.require("musixmatch");
Future = Npm.require('fibers/future');

mXm.Config.API_KEY = JSON.parse(Assets.getText('mxm.json')).api_key;


var XMLHttpRequest = Meteor.require("xmlhttprequest").XMLHttpRequest;


Meteor.methods({
	getTracks: function(currentKeyWord) {
		var future = new Future();
		if (currentKeyWord != null) {
			mXm.API.searchTrack({q: currentKeyWord, s_track_rating: "desc"}, function(modelOrCollection) {
				var attr = modelOrCollection[0].attributes;
				future["return"](attr.track_name + " " + attr.artist_name);
			});
		}
		return future.wait();
	},
	findVideo: function(searchTerm) {
		var xmlHttp = null;

	    xmlHttp = new XMLHttpRequest();
	    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + searchTerm + "&key=" + JSON.parse(Assets.getText('youtube.json')).api_key;
	    xmlHttp.open( "GET", url, false );
	    xmlHttp.send( null );
	    var videoId = JSON.parse(xmlHttp.responseText).items[0].id.videoId;
	    return videoId;
	}
});