var _ = require('underscore');

var Reason = Parse.Object.extend('Reasons');
var Vote = Parse.Object.extend('Votes');

// Save a reason
exports.save = function(req, res) {
  var xReason = req.body.xReason;
  var xCountry = req.body.xCountry;

  var reason = new Reason();
  reason.set("reason", xReason);
  reason.set("country", xCountry);

  reason.save(null, {
    success: function(reason){
      res.json({"id":reason.id});
    },
    error: function(reason, error){
      res.send("500", "Error " + error.code + " : " + error.message + " when getting photo count.");
    }
  });
};

// Get a random reason
exports.getRandomReasons = function(req, res) {
  function getVotes(reason_id) {
    var promise = new Parse.Promise();
    var promises = [];

    var up = new Parse.Query(Vote);
    up.equalTo("reason_id", reason_id);
    up.equalTo("type", "up");
    
    up.count({
      success: function(count){
        promises.push({up:count});

        var down = new Parse.Query(Vote);
        down.equalTo("reason_id", reason_id);
        down.equalTo("type", "down");
        
        down.count({
          success: function(count){
            promises.push({down:count});
          },
          error: function(error){
            res.send("500", "Error " + error.code + " : " + error.message + " when getting photo count.");
          }
        });
      },
      error: function(error){
        res.send("500", "Error " + error.code + " : " + error.message + " when getting photo count.");
      }
    });

    return promise.resolved(promises);
  };

  var query = new Parse.Query(Reason);
  var country = req.params.country;
  var reason_id = '';
  var reason = {};
  var votes = {up:0, down:0};

  query.equalTo('country', country);
  query.equalTo('approved', true);
  query.find().then(function(results) {
    var index = _.random(0, results.length-1);
    reason_id = results[index].id;
    reason = results[index];
  }).then(function(){
    var up = new Parse.Query(Vote);
    up.equalTo("reason_id", reason_id);
    up.equalTo("type", "up");
    
    return up.count();
  }).then(function(up_count){
    votes.up = up_count;
    var down = new Parse.Query(Vote);
    down.equalTo("reason_id", reason_id);
    down.equalTo("type", "down");
    
    return down.count();
  }).then(function(down_count){
    votes.down = down_count;
    var random = {status: 200, reason: reason, votes: votes};
    res.json( random );
  }, function(error) {
    res.send(500, 'Failed loading a reason');
  });
};