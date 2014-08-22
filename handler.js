"use strict";

var express = require("express");

var Handler = {
	
	empty: function() {
		return express.Router();
	},

	crud: function(model, rt) {
		var router = rt || this.empty();

		router.get("/", this.getAll(model));
		router.post("/", this.create(model));
		router.get(this.id, this.getById(model));
		router.put(this.id, this.update(model));
		router.delete(this.id, this.delete(model));

		return router;
	},

	id: "/:id([0-9a-f]{24})",

	handleError: function(callback, res) {
		return function(err, data) {
			if (err) {
				console.log(err);
				res.status(500).send({ error: err });
			} else {
				if (callback)
					callback(data);
			}
		}
	},

	getAll: function(model) {
		return function(req, res)	{
			model.find({}, function(data) {
				res.json(data);		
			}, Handler.handleError(res));
		}
	},

	create: function(model) {
		return function(req, res) {
			var modelInst = new model(req.body);
			modelInst.save(Handler.handleError(function(){	
				res.status(201).json(modelInst.toObject());
			}, res));
		}
	},

	getById: function(model) {
		return function(req, res) {
			model.findById(req.params['id'], Handler.handleError(function(data) {	
				if (data == null) res.send(404, { error: "Model was not found." });
				else res.json(data);
			}, res));
		}
	},

	update: function(model) {
		return function(req, res) {
			model.findByIdAndUpdate(req.body._id, { $set: req.body }, Handler.handleError(function(data) {
				res.json(data);
			}, res));
		}
	},

	delete: function(model) {
		return function(req, res) {
			model.remove({ _id: req.params['id'] }, Handler.handleError(function(data) {
				res.status(204).end();
			}, res));
		}
	}

};

module.exports = Handler;
