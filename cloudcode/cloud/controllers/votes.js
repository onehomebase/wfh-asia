var Vote = Parse.Object.extend('Votes');

// Save a vote
exports.save = function(req, res) {
  var xReason_id = req.body.xReason_id;
  var xType = req.body.xType;

  var vote = new Vote();
  vote.set("reason_id", xReason_id);
  vote.set("type", xType);

  vote.save(null, {
    success: function(vote){
      res.json({"id":vote.id});
    },
    error: function(reason, error){
      res.send("500", "Error " + error.code + " : " + error.message + " when getting photo count.");
    }
  });
};