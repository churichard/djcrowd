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

mXm.Config.API_KEY = JSON.parse(Assets.getText('mxm.json')).api_key;

var successCallback = function(modelOrCollection) {
	for (var i = 0; i < modelOrCollection.length; i++) {
		var attr = modelOrCollection[i].attributes;
		console.log("Track: " + attr.track_name + ", Artist: " + attr.artist_name);
	}
};

Meteor.methods({
	getTracks: function(currentKeyWord) {
		if (currentKeyWord != null) {
			mXm.API.searchTrack({q: currentKeyWord, s_track_rating: "desc"}, successCallback);
		}
	}
});