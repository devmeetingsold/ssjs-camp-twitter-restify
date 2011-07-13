var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://10.1.1.134/test');
console.log("mongo connected");

exports.reset = function() {

	UserModel.remove({}, function() {
		console.log("remove: UserModel");
	});

	TweetModel.remove({}, function() {
		console.log("remove: TweetModel");
	});
};



exports.findUser = function(username, password, callback) {
	UserModel.find({'username': username, 'pass': password}, function(err, objs) {
	 	console.log('findUser, err:' + err);
 		callback(err,objs);
	});
};

exports.addUser = function(username, pass, callback){
	var user = new UserModel();
	user['username'] = username;
	user['pass']= pass;
	user.save(function(err, rest){
		console.log(rest);
		console.log('err:' + err + ' ' + rest.toString());
		callback(err);
	});
};

exports.postTweetWithId = function(user, tweet, id, callback) {
	var t = new TweetModel();
	t['user']=user;
	t['tweet']=tweet;
	t['id']=id;
	t.save(function(err, o) {
		console.log('postTweet save callback:' + err);
		if(null==err){
			callback(o.id);
		} else {
			callback(-1);
		}
	});
};

exports.postTweet = function(user, tweet, callback) {

	TweetModel.count({}, function( err,  c) {
		console.log('count:' + err + ' ' + c);
		if(null==err){
			var t = new TweetModel();
			t['user']=user;
			t['tweet']=tweet;
			t['id']=c + 1;
			t.save(function(err, o) {
				console.log('postTweet save callback:' + err);
				if(null==err){
					callback(o.id);
				} else {
					callback(-1);
				}
			});
		} else {
			callback(-1);
		}

	});
};

exports.getTweets = function(username, callback) {
	TweetModel.find({'user': username}, function(err, objs) {
	 	callback(objs);
	});
};

exports.getUserPass = function(user, callback) {
	UserModel.find({'username': user}, function(err, o) {
		callback(o[0].pass);
	});
};

var Schema = mongoose.Schema;

var User = new Schema({
  username: String,
  pass: String
});
mongoose.model('User', User);
UserModel = mongoose.model('User');


var Tweet = new Schema({
	tweet: String,
	user: String,
	id: Number
});
mongoose.model('Tweet', Tweet);
TweetModel = mongoose.model('Tweet');
