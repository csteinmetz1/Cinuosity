/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var favicon = require('serve-favicon');
var keys = require('./keys');

// Database Setup
var smallDictionary = require("./data/small.json")
var mediumDictionary = require("./data/medium.json");
var largeDictionary = require("./data/large.json");
var chineseDictionary = require("./data/chinese.json");
var frenchDictionary = require("./data/french.json");
var greekDictionary = require("./data/greek.json");
var koreanDictionary = require("./data/korean.json");
var spanishDictionary = require("./data/spanish.json");
var swahiliDictionary = require("./data/swahili.json");
var swedishDictionary = require("./data/swedish.json");
var commonDictionary = require("./data/common.json");

var client_id = keys.client_id;
var client_secret = keys.client_secret;
var redirect_uri = keys.redirect_uri;

var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

// Set favicon
app.use(favicon(__dirname + '/public/images/sine.ico'));

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private playlist-modify-public user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        spotifyApi.setAccessToken(access_token);
        console.log("authenticated");

        var getMe = function(){
          return spotifyApi.getMe()
          .then(function(data) {
            console.log('User ID', data.body.id);
            return data.body.id
          }, function(err) {
            console.log('Something went wrong!', err);
          })
        };

        var createPlaylist = function(userId, playlistName) {
          return spotifyApi.createPlaylist(userId, playlistName, { 'public' : true })
          .then(function(data) {
            console.log("Created", playlistName, "playlist");
            return data.body.id
          }, function(err) {
            console.log('Something went wrong!', err);
          });
        }

        var searchSpotify = function(query) {
          console.log("Searching", query)          
          return spotifyApi.searchTracks(query)
          .then(function(data) {
            if (data.body.tracks.items.length !== 0) {
              var trackURI = data.body.tracks.items[0].uri;
              var trackName = data.body.tracks.items[0].name;
              var trackArtist = data.body.tracks.items[0].artists[0].name;
              console.log('Added', trackName, 'by', trackArtist, "with URI", trackURI);
              return trackURI;
            } else {
              console.log('No results for', query);
            }
          }, function(err) {
            console.error(err);
          });
        };

        /*
        var getRandomWord = function() {
          var words = ["sondorblue", "daddys beemer", "et anderson", "the high divers", "slide", "adksfjkasjdf", "motorsport", "post"];
          return words[Math.floor(Math.random()*7)];
         }
         */

        var getRandomWord = function() {
          return new Promise(function(resolve, reject) {
            var randomWord = commonDictionary[Math.floor(Math.random()*commonDictionary["size"])];
            if (randomWord != undefined) {
              resolve(randomWord);
            } else {
              reject("no random word")
            }
          })
        };

        var addToPlaylist = function(userId, playlistId, trackURIs) {
          console.log(userId, playlistId, trackURIs);
          return spotifyApi.addTracksToPlaylist(userId, playlistId, trackURIs)
          .then(function(data) {
            console.log('Added', trackURIs.length, 'tracks to playlist');
          }, function(err) {
            console.log('Something went wrong when adding to playlist', err);
          });
        };

        /**
        * Builds a random Spotify playlist 
        * @param  {string} playlistName Name of the playlist
        * @param  {number} size Number of songs in the playlist
        */
        var buildPlaylist = function(playlistName, size) {
          var trackURIs =[];
          var userId;
          var playlistId;
          function buildPlaylistNow() {
            getRandomWord()
            .then(function(randomWord){
                return searchSpotify(randomWord);
            }, function(err){
              console.error(err);
            })
            .then(function(trackURI) {
              console.log(trackURI);
              if (trackURI != undefined) {
                trackURIs.push(trackURI)
                if (trackURIs.length == size) {
                  getMe()
                  .then(function(data){
                    userId = data;
                    return createPlaylist(userId, playlistName);
                  }, function(err){
                    console.log(err)
                  })
                  .then(function(playlistId){
                    return addToPlaylist(userId, playlistId, trackURIs);
                    res.redirect('/playlistReady')
                  }, function(err){
                    console.log(err)
                  });
                }
              } else {
                buildPlaylistNow()
              }
            }, function(err) {
              buildPlaylistNow();
              console.log("Error buidling playlist", err);
            });
            };
          for (i=0; i < size; i++) {
            buildPlaylistNow();
          };
        };

        getRandomWord()
        .then(function(randomWord){
          // multistep process to build our random playlist
          var playlistName = "(Cinuosity) " + randomWord;
          buildPlaylist(playlistName, 20);
        }, function(err){
          console.log(err);
        })

        //spotifyApi.addTracksToPlaylist('1298764427', "6pR3WzV6x4I4UMNtfcJnoV" ,["spotify:track:7uYYzBBhFVJvW9WgOiknvZ"])


        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
        }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/about', function(req, res) {
  res.sendfile("./public/about.html");
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});



console.log('Listening on 9000');
app.listen(9000);
