var _  = require('lodash'),
		ObjectId = require('mongodb').ObjectID,
		validId;

	//Check if a given string is a valid mongo ObjectId
	validId = function(id){

		checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

		if (id.match(checkForHexRegExp)) {
			return true;
		}else{
			return false;
		}

	};


module.exports =  {

	//Create a new record
	create: function (options, callback){

		//Save the object into the collection
		this.collection.insert(options.body, function(err, result) {

			if(result.length === 1){
				result = result[0];
			}

			//Pass results and req/res to the callback
			return callback(err, result);

		}.bind(this));

	},

	//Read an existing record / records
	read: function(options, callback){

		_.each(options.query, function(item, key){
			if(validId(item)){
				options.query[key] = ObjectId(item);
			}
		}.bind(this));

		//Find using optional query or find all
		this.collection.find(options.query || {}).toArray(function(err, result){

			if(result.length === 1){
				result = result[0];
			}

			callback(err, result);

		}.bind(this));

	},

	//Update a record
	update: function(options, callback){
		
		_.each(options.query, function(item, key){
			if(validId(item)){
				options.query[key] = ObjectId(item);
			}
		}.bind(this));

		//If the id has been included in the body, remove it
		if(options.body._id){
			delete options.body._id;
		}

		//Check if the body contains any populated fields and depopulate them
		this.collection.update(options.query,{$set: options.body}, function(err, result){
			
			callback(err, result);
				
		}.bind(this));

	},

	//Delete a record
	delete: function(options, callback){

		_.each(options.query, function(item, key){
			if(validId(item)){
				options.query[key] = ObjectId(item);
			}
		}.bind(this));
		
		//Use dryCrud.read to find the document to be deleted
		this.collection.remove(options.query, function(err, result){

			return callback(err, result)

		}.bind(this));

	}

};