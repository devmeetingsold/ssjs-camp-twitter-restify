// Adam Jodłowski, SSJS DEVCAMP 2011

var options = {
	serverName: 'SSJS Server',
	accept: [ 'application/json', 'text/html' ]
}

var restify = require('restify');
var server = restify.createServer(options);

server.listen(3000);

// -----------------------------------------------------------------------------

// lista zalogowanych aktualnie użytkowników
// TODO wygaszanie sesji
var users = [];

// logowanie
server.post('/login', function(req, res) {

	if (req.params.user) {
	
		postLogin(req.params.user, req.params.pass, function(response) {
	
			res.send(response.status, response, cors);
	
		});
	
	} else {
	
		res.send(401, {'status': 401}, cors);
	
	}
	
});

var postLogin = function (user, pass, callback) {

	database.getUserPass(user, function(password) {
	
		if (pass === password) {
		
			var token = getRandomToken(16);
			users[token] = user;
			callback({ status: 200, token: token });
		
		} else {
		
			callback({ status: 401 });
		
		}
	
	});

};


// -----------------------------------------------------------------------------

// tweetowanie
server.post('/tweet', [authorization], function(req, res, next) {

	//console.log(req.params.tweet);
	
	postTweet(req.params.token, req.params.tweet, function(response) {
	
		res.send(response.status, response, cors);
	
	});

});

var postTweet = function (token, tweet, callback) {

	database.postTweet(users[token], tweet, function(id) {
	
		if (id >= 0) {
		
			callback({status: 201, id: id});
		
		} else {
		
			callback({status: 500}); // sytuacja wyjątkowa, nie udało się dodać tweeta w bazie
		
		}
	
	});

};

// -----------------------------------------------------------------------------

// pobieranie tweetów
server.get('/tweets/:user', function(req, res, next) {

	//console.log('jestem tu: ');
	//console.log(req.uriParams);
	//console.log(req.params);
	//console.log('----------');
	//console.log(req);

	getTweets(req.uriParams.user, function(response) {
	
		//console.log(response);
	
		res.send(response.status, response);
	
	});

});

var getTweets = function (user, callback) {

	database.getTweets(user, function(dbtweets) {
		
		callback({status: 200, tweets: dbtweets});
	
	});

};

// -----------------------------------------------------------------------------

// pobieranie użytkowników // TODO quick&dirty
server.get('/users', function(req, res, next) {

	getTweets(req.uriParams.user, function(response) {
	
		database.getUsers(function(users) {
		
			res.send(200, users, cors);
		
		});
	
	});

});

// pobieranie naszych followersów // TODO quick&dirty
server.post('/follow', [authorization], function(req, res, next) {

	var user = users[req.params.token];

	database.postFollower(user, req.params.follow);
	
	res.send(201, {status: 201}, cors);

});

// pobieranie użytkowników // TODO quick&dirty
server.get('/followers/:user', function(req, res, next) {

	database.getFollowers(req.uriParams.user, function(response) {
	
		
			res.send(200, response, cors);
	
	
	});

});

// pobieranie timeline usera // TODO quick&dirty
server.get('/timeline/:user', function(req, res, next) {

	database.getTimeline(req.uriParams.user, function(response) {
		
		res.send(200, {status: 200, tweets: response}, cors);
	
	});

});




// -----------------------------------------------------------------------------

// preprocesor

function authorization(req, res, next) {

	if ((users[req.params.token] !== '') && (typeof users[req.params.token] === 'string')) {
		return next();
	} else {
		res.send(401);
	}
	
}

// dodatkowe nagłówki potrzebne do współpracy z corse
var cors = {'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'};


// -----------------------------------------------------------------------------


































var db = function () {
	
	var tweets = [];
	var followers = []; // <- kogo on followuje
	
	/*tweets.push({user: 'adamus', tweet: 'lubię placki', id: tweets.length});
	tweets.push({user: 'adamus', tweet: 'kocham SSJS', id: tweets.length});
	tweets.push({user: 'radek', tweet: 'smaruj dżemorem', id: tweets.length});
	tweets.push({user: 'radek', tweet: 'zjedz kota', id: tweets.length});
	tweets.push({user: 'david', tweet: '<3 Enterprise Java', id: tweets.length});
	tweets.push({user: 'david', tweet: 'jestem głodny', id: tweets.length});
	tweets.push({user: 'radek', tweet: 'więcej sera', id: tweets.length});
	tweets.push({user: 'adamus', tweet: 'jestem tu', id: tweets.length});
	tweets.push({user: 'adamus', tweet: 'jestem tu', id: tweets.length});*/
	

    return {
    
		getUserPass: function(user, callback) {
		
			callback(user); // TODO
		
		},
		
		postTweet: function(user, tweet, callback) {
		
			tweets.push({user: user, tweet: tweet, id: tweets.length});
		
			callback(tweets.length - 1);
		
		},
		
		getTweets: function(user, callback) {
		
			var twts = []; //zwracane tweety usera
		
			tweets.forEach(function(tweet) {
			
				if (tweet.user === user) {
					twts.push({tweet: tweet.tweet, id: tweet.id});
				}
			
			});
			
			
			
			callback(twts);
		
		},
		
		getUsers: function(callback) {
		
			var usrs = [];
		
			tweets.forEach(function(tweet) {
				usrs[tweet.user] = 0;
			});
			
			var tbusers = Object.keys(usrs);
			
			callback(tbusers);
		
		},
		
		postFollower: function(user, follower) {
		
			var flws = followers[user];
		
			if (!flws) {
				flws = [];
			}
			
			
			flws.push(follower); // TODO wielokrotne dodawanie ludzi followowanych
			
			followers[user] = flws;
			
			console.log(followers);
			
		},
		
		getFollowers: function(user, callback) {
		
			var flws = followers[user]; //console.log(flws);
			var usrs = [];
		
			if (flws) {
				
				flws.forEach(function(followedUser) {
					usrs[followedUser] = 0;
				});
				
				var f = Object.keys(usrs);
			
				callback(f);
				
			} else {
			
				callback([]);
			
			}
		
		},
		
		getTimeline: function(user, callback) {
		
			var t = [];
			var f = followers[user];
			
			if (!f) {
				f = [];
			}
				t=tweets.filter(function(tweet) {
					return (user === tweet.user || f.indexOf(tweet.user) >= 0) 
				});
				
				callback(t);
			//} else {
				//callback([]);
			//}
		
		}
        
    }
};

// mock bazy danych
var database = db();





//










var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function getRandomToken(len) {

	var result = "";
	var rand;
	for(var i = 0; i < len; i++) {
    	rand = Math.floor(Math.random()*(alphabet.length+1));
    	result += alphabet.substring(rand, rand + 1);
	}
	
	return result;

}
