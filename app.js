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
var fs = require('fs');
var keys = require('./keys');

// Foregin Dictionaries
var frenchDictionary = require("./data/french.json");
var greekDictionary = require("./data/greek.json");
var spanishDictionary = require("./data/spanish.json");
var swedishDictionary = require("./data/swedish.json");
var germanDictionary = require("./data/deutsch.json");
var swahiliDictionary = require("./data/swahili.json");
var chineseDictionary = require("./data/chinese.json");
var koreanDictionary = require("./data/korean.json");
var japaneseDictionary = require("./data/japanese.json");
var italianDicitonary = require("./data/italiano.json");
var netherlandsDictionary = require("./data/nederlands.json");
var norweigenDictionary = require("./data/norsk.json");
var portugueseDictionary = require("./data/portuguese.json");
var swissDictionary = require("./data/swiss.json");

// English Dictionaries 
var commonDictionary = require("./data/common.json");
var smallDictionary = require("./data/small.json");
var mediumDictionary = require("./data/medium.json");
var largeDictionary = require("./data/large.json");
//var maleDictionary  = require("./data/male.json");
//var femaleDictionary = require("./data/female.json");
var familyDictionary = require("./data/family.json");
var shortUrbanDictionary = require("./data/short_urban_full.json")
var mediumUrbanDictionary = require("./data/medium_urban_full.json")
var longUrbanDictionary = require("./data/long_urban_full.json")


// Set API keys - make sure you have created the keys.js file
var client_id = keys.client_id;
var client_secret = keys.client_secret;
var redirect_uri = keys.redirect_uri;

var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
});

var playlistWeirdness = 50.0; // default playlist weirdness

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
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

// Set favicon
app.use(favicon(__dirname + '/public/images/sine.ico'));

app.get('/login/:weirdness', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  playlistWeirdness = req.params.weirdness;
  console.log(playlistWeirdness);

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

        var searchSpotify = function(query, playlistWeirdness, popFilterOn) {
          console.log("Searching", query)
          if (playlistWeirdness > 0.0 && popFilterOn) {
            var popularity = ((1.0 - Math.log10(playlistWeirdness/10.0))*100.0) + 25;
          } else if (playlistWeirdness < 20 && popFilterOn) {
            var popularity = 100;
          } else {
            var popularity = 100;
          }   
          console.log('Popularity filter', popularity);
          return spotifyApi.searchTracks(query, { limit : 25, offset : 0 })
          .then(function(data) {
            numResults = data.body.tracks.items.length;
            if (numResults !== 0) {
              for (var idx = 0; idx < numResults; idx++) {
                var trackPop = data.body.tracks.items[idx].popularity;
                if (trackPop <= popularity && Math.random() >= 0.5) {
                  var trackURI = data.body.tracks.items[idx].uri;
                  var trackName = data.body.tracks.items[idx].name;
                  var trackArtist = data.body.tracks.items[idx].artists[0].name;
                  console.log('Added', trackName, 'by', trackArtist, "with URI", trackURI, "and popularity:", trackPop);
                  return trackURI;
                }
              }
            } else {
              console.log('No results for', query);
            }
          }, function(err) {
            console.error(err);
          });
        };

        var getWordFromDictionary = function(mode, dict){
          return new Promise(function(resolve, reject) {
            if (mode == 'english') {
              if (dict == 'common') {
                var randomWord = commonDictionary[Math.floor(Math.random()*commonDictionary["size"])];
              } else if (dict == 'small') {
                var randomWord = smallDictionary[Math.floor(Math.random()*smallDictionary["size"])];
              } else if (dict == 'medium') {
                var randomWord = mediumDictionary[Math.floor(Math.random()*mediumDictionary["size"])];
              } else if (dict == 'large') {
                var randomWord = largeDictionary[Math.floor(Math.random()*largeDictionary["size"])];        
              } else if (dict == 'family') {
                var randomWord = familyDictionary[Math.floor(Math.random()*familyDictionary["size"])]; 
              } else if (dict == 'shortUrban') {
                var randomWord = shortUrbanDictionary[Math.floor(Math.random()*shortUrbanDictionary["size"])];             
              } else if (dict == 'mediumUrban') {
                var randomWord = mediumUrbanDictionary[Math.floor(Math.random()*mediumUrbanDictionary["size"])];
              } else if (dict == 'longUrban') {
                var randomWord = longUrbanDictionary[Math.floor(Math.random()*longUrbanDictionary["size"])];
              } else if (dict == 'family') {
                var randomWord = familyDictionary[Math.floor(Math.random()*familyDictionary["size"])];
              }
            } else if (mode == 'international') {             
              if (dict == 'chinese') {
                var randomWord = chineseDictionary[Math.floor(Math.random()*chineseDictionary["size"])];
              } else if (dict == 'french') {
                var randomWord = frenchDictionary[Math.floor(Math.random()*frenchDictionary["size"])];
              } else if (dict == 'greek') {
                var randomWord = greekDictionary[Math.floor(Math.random()*greekDictionary["size"])];
              } else if (dict == 'korean') {
                var randomWord = koreanDictionary[Math.floor(Math.random()*koreanDictionary["size"])];
              } else if (dict == 'spanish') {
                var randomWord = spanishDictionary[Math.floor(Math.random()*spanishDictionary["size"])];
              } else if (dict == 'swahili') {
                var randomWord = swahiliDictionary[Math.floor(Math.random()*swahiliDictionary["size"])];
              } else if (dict == 'swedish') {
                var randomWord = swedishDictionary[Math.floor(Math.random()*swedishDictionary["size"])];
              } else if (dict == 'german') {
                var randomWord = germanDictionary[Math.floor(Math.random()*germanDictionary["size"])];
              }
            }
            if (randomWord != undefined) {
              console.log("got a random word", randomWord)
              resolve(randomWord)
            } else {
              reject("No random word found in dictionary", dict)
            };  
          })
        };

        var getRandomWord = function(weirdness, mode, special) {
          return new Promise(function(resolve, reject) {
            if (weirdness > 89){
              if (mode == 'english'){
                var dictionaries = ['large', 'large', 'large', 'large'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict])
              .then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 79) {
              if (mode == 'english'){
                var dictionaries = ['medium', 'large', 'large', 'large', 'family'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 69) {
              if (mode == 'english'){
                var dictionaries = ['medium', 'medium', 'large', 'large', 'family'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 59) {
              if (mode == 'english'){
                var dictionaries = ['medium', 'medium', 'medium', 'large', 'family'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 49) {
              if (mode == 'english'){
                var dictionaries = ['small', 'medium', 'medium', 'medium', 'large'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 39) {
              if (mode == 'english'){
                var dictionaries = ['small', 'small', 'medium', 'medium'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 29) {
              if (mode == 'english'){
                var dictionaries = ['common', 'small', 'small', 'medium'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 19) {
              if (mode == 'english'){
                var dictionaries = ['common', 'small', 'medium'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict]);
            } else if (weirdness > 9 ) {
              if (mode == 'english'){
                var dictionaries = ['common', 'small'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", dictionaries[dict])
            } else {
              if (mode == 'english'){
                var dictionaries = ['common'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              } else {
                var dictionaries = ['chinese', 'french', 'greek', 'greek', 'korean', 'spanish', 'swahili', 'swedish', 'german'];
                var dict = Math.floor(Math.random() * dictionaries.length);
              }
              getWordFromDictionary(mode, dictionaries[dict]).
              then(function(randomWord){
                if (randomWord != undefined) {
                  resolve(special + " " + randomWord);
                }
                }, function(err) {
                  reject(err)
                }
              );
              console.log("Weirdness:", weirdness, "Dictionary:", 'common');
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

        var trackURIs =[];
        var userId;
        var playlistId;

        var buildPlaylist = function(playlistName, size, weirdess, special="") {
          return new Promise(function(resolve, reject) {
          function buildPlaylistNow() {
            getRandomWord(playlistWeirdness, mode, special)
            .then(function(randomWord){
                return searchSpotify(randomWord, playlistWeirdness, true);
            }, function(err){
              console.error(err);
            })
            .then(function(trackURI) {
              if (trackURI != undefined) {
                console.log(trackURI);
                trackURIs.push(trackURI)
                if (trackURIs.length == size) {
                  getMe()
                  .then(function(data){
                    userId = data;
                    return createPlaylist(userId, playlistName);
                  }, function(err){
                    console.log(err)
                  })
                  .then(function(playlistId_){
                    playlistId = playlistId_
                    return addToPlaylist(userId, playlistId, trackURIs);
                  }, function(err){
                    console.log(err)
                  })
                  .then(function(data){
                    resolve("Playlist complete.")
                  }, function(err){
                    reject(err)
                  })
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
        })};

        var special = "";
        var mode = 'international';

        // hardcoded playlist naming weirdness
        getRandomWord(20, mode, special)
        .then(function(randomWord){
          // multistep process to build our random playlist
          var playlistName = "(Cinuosity)";
          return buildPlaylist(playlistName, 10, playlistWeirdness, special);
        }, function(err){
          console.log(err);
        })
        .then(function(randomWord){
          res.redirect('/done' + "/" + userId + "/" + playlistId);
        },
        function(err){
          console.log(err);
        });

        dateStamp = new Date()

        fs.readFile('./data/stats.json', 'utf8', function readFileCallback(err, data){
          if (err){
              console.log(err);
          } else {
          obj = JSON.parse(data); //now it an object
          obj.statistics.push({date: dateStamp, weirdess: playlistWeirdness}); // add some data
          json = JSON.stringify(obj); // convert it back to json
          fs.writeFile('./data/stats.json', json, 'utf8',  function(err) {
            if (err) throw err;
            console.log('complete');
            }
          );        
        }});

        //spotifyApi.addTracksToPlaylist('1298764427', "6pR3WzV6x4I4UMNtfcJnoV" ,["spotify:track:7uYYzBBhFVJvW9WgOiknvZ"])

        // we can also pass the token to the browser to make requests from there
        //res.redirect('/#' +
        //  querystring.stringify({
        //    access_token: access_token,
        //    refresh_token: refresh_token
        //}));
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

app.get('/done/:userId/:playlistId', function(req, res) {
  var userId = req.params.userId;
  var playlistId = req.params.playlistId;
  res.render("done.ejs", {playlist : playlistId, user: userId});
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
