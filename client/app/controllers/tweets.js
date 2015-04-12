TweetStream = new Meteor.Stream('tweets');

TweetStream.on('tweet', function(tweet) {
	tweet.created_at = moment(tweet.created_at).toDate();
	var keyword = getKeyWords(tweet);
	CurrentKeyWord = keyword;
	var query = {};
	query[keyword] = new RegExp(/[0-9]+/);
	var keyword_json = KeyWords.findOne(query);
	if (keyword_json == undefined) {
		console.log("Current frequency: 1");
		var newQuery = {};
		newQuery[keyword] = "1";
		KeyWords.insert(newQuery);
	}
	else {
		// Increments the frequency
		var newFreq = String(parseInt(String(keyword_json[keyword]))+1);
		console.log("Current frequency: " + newFreq);
		var newQuery = {};
		newQuery[keyword] = newFreq;
		KeyWords.update(query, newQuery);
	}
	Tweets.insert(tweet);
	Meteor.call('getTracks', keyword);
});

Template.tweets.tweets = function() {
	return Tweets.find({}, {
		sort: {
			'created_at': -1
		}
	});
};

Template.tweets.isPhoto = function() {
	return this.type === "photo";
};

function getKeyWords(tweet) {
	var text = tweet.text.toLowerCase();
	var hashtag = Hashtag;
	var hashtagIndex = text.indexOf(hashtag);
	text = text.substring(0, hashtagIndex).trim() + text.substring(hashtagIndex + hashtag.length, text.length).trim();
	return text;
}