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

	var track = Meteor.call('getTracks', keyword, function(error, result) {
		if (error) {
			console.log('ERROR: ', error.reason);
		}
		else {
			result = result.replace(/\s/g, "+");
			console.log(Meteor.call('findVideo', result, function(error, videoId) {
				if (error) {
					console.log('ERROR: ', error.reason);
				}
				else {
					console.log("YouTube URL: " + 'http://youtube.com/watch?v=' + videoId);
					YouTubeId.push(videoId);
					YT.load();
				}
			}));
		}
	});
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

Template.tweets.rendered = function() {
	// YouTube API will call onYouTubeIframeAPIReady() when API ready.
    // Make sure it's a global variable.
    onYouTubeIframeAPIReady = function () {
    	var id = YouTubeId[0];
    	YouTubeId = YouTubeId.splice(0, 1);

        // New Video Player, the first argument is the id of the div.
        // Make sure it's a global variable.
        player = new YT.Player("player", {

        	height: "400", 
        	width: "600", 

            // videoId is the "v" in URL (ex: http://www.youtube.com/watch?v=LdH1hSWGFGU, videoId = "LdH1hSWGFGU")
            videoId: id,

            // Events like ready, state change, 
            events: {
            	onReady: function (event) {
                    // Play video when player ready.
                    event.target.playVideo();
                }
            }
        });
    };
}