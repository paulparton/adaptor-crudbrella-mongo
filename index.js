var _  = require('lodash'),
		ObjectId = require('mongodb').ObjectID;

module.exports =  {

	//Create a new record
	create: function (options){

		return function(req, res){

			//If no options are provided default to an empty object
			options = options || {};

			//Save the object into the collection
			this.collection.insert(req.body, function(err, result) {

				//Pass results and req/res to the dbCallback
				this.dbCallback({
					req: req, 
					res: res, 
					err: err, 
					result: result,
					onSuccess:options.onSuccess || this.successCallback,
					onError:options.onError || this.errorCallback
				});

			}.bind(this));

		}.bind(this);

	},
	//Check if a given string is a valid mongo ObjectId
	validId: function(id){

		checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

		if (id.match(checkForHexRegExp)) {
			return true;
		}else{
			return false;
		}

	},
	//Read an existing record / records
	read: function(options){

		return function (req, res){

			//If no options are provided default to an empty object
			options = options || {};

			//If no query has been provided default to an empty object
			options.query = options.query || {};

			//Create a local copy of the query definition to be parsed
			var query = JSON.parse(JSON.stringify(options.query)) || {};

			//Loop through every object in query
			_.each(query, function(item, key){

				//If the value starts with a ^ use the item value as a key for req.params
				if(item[0] === "^"){

					if(this.validId(req.params[item.replace("^","")])){	

						query[key] = ObjectId(req.params[item.replace("^","")]);

					}else{

						query[key] = req.params[item.replace("^","")];	

					}
					
				}

			}.bind(this));

			//Find using optional query or find all
			this.collection.find(query || {}).toArray(function(err, items){

				if(items.length === 1){
					items = items[0];
				}

				//Pass results and req/res to the dbCallback
				this.dbCallback({
					req: req, 
					res: res, 
					err: err, 
					result: items,
					onSuccess:options.onSuccess || this.successCallback,
					onError:options.onError || this.errorCallback
				});

			}.bind(this));

		}.bind(this);

	},

	//Update a record
	update: function(options){

		return function(req, res){

			var requestId;

			//If no options are provided default to an empty object
			options = options || {};

			//If the id has been included in the body, remove it
			requestId = ObjectId(req.params.id); 
			delete req.body._id;
			
			//Check if the body contains any populated fields and depopulate them
			this.collection.update({'_id': requestId},{$set: req.body}, function(err, result){
				
				if(!err){
					result = req.body;
				}
				
				this.dbCallback({
					req: req, 
					res: res, 
					err: err, 
					result: result,
					onSuccess:options.onSuccess || this.successCallback,
					onError:options.onError || this.errorCallback
				});
				
			}.bind(this));

		}.bind(this);

	},

	//Delete a record
	delete: function(options){

		return function(req, res){

			//If no options are provided default to an empty object
			options = options || {};

			//If the id has been included in the body, remove it
			if(req.body._id) { delete req.body._id; }

			//Use dryCrud.read to find the document to be deleted
			this.collection.remove({_id: ObjectId(req.params.id)}, function(err, result){

				//Pass results and req/res to the dbCallback
				this.dbCallback({
					req: req, 
					res: res, 
					err: err, 
					result: "",
					onSuccess:options.onSuccess || this.successCallback,
					onError:options.onError || this.errorCallback
				});

			}.bind(this));

		}.bind(this);

	}

};