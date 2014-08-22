"use strict";

var express = require("express");
var fs      = require("fs");
var path    = require("path");

var modelDir = "./models/";
var handlerDir = "./handlers/";

exports.service = function(config) {
	var router = express.Router();

	var bodyParser = require("body-parser");
	router.use(bodyParser.json());
	
	var mongoose = require("mongoose");

	mongoose.connect(typeof config.connection === 'string' ? config.connection :	"mongodb://" + (config.connection.user ? config.connection.user + ":" + config.connection.password + "@" : "")  + config.connection.host + ":27017/" + config.connection.database);

	for (var i = 0; i < config.collections.length; i++) {
		var modelConfig = config.collections[i];
		var name = modelConfig.name;

		var model = require(path.resolve(modelDir + name + ".js"))(mongoose, name);
	
		var handlerPath = handlerDir + modelConfig.handler + ".js";
		var handler = fs.existsSync(handlerPath)
					?	require(path.resolve(handlerPath))(exports.Handler, model)
					: exports.Handler.crud(model);
		
		var route = modelConfig.route || name;

		router.use("/" + route, handler);
	}

	return router;
};

exports.Handler = require("./handler");

exports.Server = function(config) {
	var app = express();
	app.use("/", exports.service(config));
	return app;
};
