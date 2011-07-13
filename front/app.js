var CONFIG = {
    URL: 'http://10.1.1.141:3000'
}

var app = require('express').createServer(),
    restify = require('restify'),
    express = require('express'),
    async = require('async');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "Cheesecake" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var client = restify.createClient({
   url: CONFIG.URL,
   version: '1.2.3',
   retryOptions: {
       retries: 2,
       minTimeout: 250
   },
   contentType: 'application/json'
})

function timeline(req, res, username, path) {
    
    if (typeof(req.session.token) === 'undefined') {
        return res.redirect('/login');
    }
    
    var data = {
        tweets : [],
        users : [],
        following : [],
        profile_name: username        
    };
    
    async.parallel([
        function(callback) {
            client.get(path, function(e, body, h) {
                data.tweets = body.tweets.reverse();
                callback();
            });
        },
        function(callback) {
            client.get('/users/', function(e, b, h) {    
                data.users = b;
                callback();
            });
        },
        function(callback) {
           client.get('/followers/' + username, function(e, b, h) {    
                data.following = b;
                callback();
           });
        }
        
    ],
    // optional callback
    function(err, results) {
        res.render('index.jade', data);
    });
}


app.get('/', function(req, res) {
    timeline(req, res, req.session.username, '/timeline/' + req.session.username);
})

app.get('/u/:username', function(req, res) {
    timeline(req, res, req.params.username, '/tweets/' + req.params.username);
});

//login page
app.get('/login', function(req, res) {
    return res.render('login.jade');    
});

//login logic
app.post('/login', function(req, res) {

    var request =  {
        path: '/login',
        body: {
            user: req.param('username'),
            pass: req.param('password')
        },
        expect: [200, 401]
    };

    client.post(request, function(err, body, headers) {
        if (body.status === 200) {
            req.session.token = body.token;
            req.session.username = req.param('username');
            res.redirect('home');
        } else {
            res.redirect('/login');
        }
    });
});

app.post('/tweet', function(req, res) {
    
    if (typeof(req.session.token) === 'undefined') {
           return res.redirect('/login');
    }
    
    var request = {
       path: '/tweet',
       body: {
           token: req.session.token,
           tweet: req.param('tweet')
       },
       expect: [201]
    }
    
    client.post(request, function(err, body, headers) {
        if (body.status === 201) {
            res.redirect('home');
        } 
    });
});

app.get('/follow/:username', function(req, res) {
    
    if (typeof(req.session.token) === 'undefined') {
           return res.redirect('/login');
    }
    
    var request = {
       path: '/follow',
       body: {
           token: req.session.token,
           follow: req.params.username
       },
       expect: [201]
    }
    
    client.post(request, function(err, body, headers) {
        if (body.status === 201) {
            res.redirect('home');
        } 
    });
});


app.listen(3000);