this.app = {};
(function (global, exports) {

	var _createCORSRequest = function (method, url) {
		var xhr = new XMLHttpRequest();
		if ('withCredentials' in xhr) {
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest !== 'undefined') {
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			xhr = null;
		}

		return xhr;
	};

	var CheesterService = (function () {
		//var _host = 'http://10.1.1.141:3000/';
		var _host = 'http://localhost:3000/';

		var request = function (path, method, obj, onload, ctx) {
			var request = _createCORSRequest(method, _host + path);
			request.setRequestHeader('Content-Type', 'application/json');
			request.onload = function () {
				onload.call(ctx || request, JSON.parse(request.responseText), request);
			};
			request.send(JSON.stringify(obj));
		}

		return {
			request: request
		};
	})();

	var Tweet = function (id, content) {
		this.dom_id = 'tweet_' + id;
		this.id = id;
		this.content = content;

		this.el = new Element('article', { id: this.dom_id, 'class': 'tweet' }).update(this.content);
	};

	var TweetsList = function (el) {
		this._list = [];
		this._el = $(el);
	};
	TweetsList.prototype.add = function (tweet) {
		if (!this._list[tweet.id]) {
			this._list[tweet.id] = tweet;

			this._el.insert({ top: tweet.el });
		}
	};
	TweetsList.prototype.clear = function () {
		this._list.forEach(function (t) {
			t.el.remove();
		});
		this._list = [];
	};

	var Cheester = (function () {
		var pub = {},
			_token = null,
			_user = null,
			_tweets = new TweetsList('tweets_list');

		var _onLoginSubmit = function (e) {
			var u_el = $('login_user'),
				p_el = $('login_pass');

			pub.clear();

			CheesterService.request(
				'login', 'POST',
				{ user: $F(u_el), pass: $F(p_el) },
				function (resp) {
					if (resp.status === 200) {
						_token = resp.token;
						_user = $F(u_el);
						u_el.value = '';
						p_el.value = '';
						pub.refresh();
						alert('Zalogowano poprawnie');
					} else {
						p_el.value = '';
						alert('Złe hasło');
					}
				}
			);
		};

		var _onTweetSubmit = function (e) {
			var t_el = $('tweet_content');

			CheesterService.request(
				'tweet', 'POST',
				{ token: _token, tweet: $F(t_el) },
				function (resp) {
					if (resp.status === 201) {
						_tweets.add(new Tweet(resp.id, $F(t_el)));
						t_el.value = '';
						t_el.focus();
					}
					else {
						alert('Kiś błont: ' + resp.status);
					}
				}
			);
		};

		pub.init = function () {
			$('login_submit').observe('click', _onLoginSubmit);
			$('tweet_submit').observe('click', _onTweetSubmit);

			global.window.setInterval(pub.refresh.bind(pub), 2000);
		}

		pub.refresh = function () {
			if (_token == null) return;

			CheesterService.request(
				'tweets/' + _user, 'GET',
				{ token: _token },
				function (resp) {
					resp.tweets.forEach(function (t) {
						_tweets.add(new Tweet(t.id, t.tweet));
					});
				}
			);
		};

		pub.clear = function () {
			_token = null;
			_user = null;
			_tweets.clear();
		};
		

		return pub;
	})();

	
	exports.Cheester = Cheester;

}).call({}, this, this.app);
