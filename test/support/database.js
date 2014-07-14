var async = require('async');
var mongodb = require('mongodb');

function DatabaseTestSupport(config){
  if (!(this instanceof DatabaseTestSupport)) return new DatabaseTestSupport(config);

  this.config = config;
  this.db =  null;
}

DatabaseTestSupport.prototype.connect = function(cb){
  mongodb.Db.connect(this.config.mongo_url, {w: 1}, function(err, db) {
    this.db = db;
    cb(err, this.db);
  }.bind(this));
};

DatabaseTestSupport.prototype.teardown = function(cb){
  this.db.collections(function(err, collections){
    if (err) return cb(err, null);
    if (!collections) cb(new Error('Missing collections'));

    async.eachSeries(collections, function(collection, next){
        collection.drop(function(){ next();});
    }, cb);
  });
};

DatabaseTestSupport.prototype.close = function(cb){
  this.db.close(cb);
};

module.exports = DatabaseTestSupport;