/* 
 */

var mongoose = require('mongoose');
var db;
if (process.env['DUOSTACK_DB_MONGODB']) db = mongoose.connect(process.env['DUOSTACK_DB_MONGODB']);
else db = mongoose.connect('mongodb://localhost/ankieta');

var utilsModule = require('./utils');

/* Obiekt bazy danych.
 *
 */

function Database() {};
exports.Database = Database;

// pola związane z bazą danych
Database.prototype = {
	
};
		

// wstawienie wyniku ankiety
Database.prototype.insertResult = function (json, callback) {

	var res = new ResultModel();
	res.username = json.username;
	res.password = json.password;
	res.poll = json.label;

	try {
		res.answers = JSON.parse(json.answers);
	} catch (e) {};

	if (!(res.poll) || !(res.answers)) {
		callback({"status" : "error", "message": "błędne dane"});
		return;
	}
	
	res.save(callback('{"status" : "success"}'));
		
};

// wstawienie wyniku ankiety
Database.prototype.selectResults = function (author, label, callback) {

	var response = [];

	ResultModel.find({'poll': label}, function(err, documents) {
		
		if (documents[0]) {
		
			for (var i = 0; i < documents.length; i++) {
				
				var res = new Object();
				res.user = documents[i].doc.username;
				res.answers = documents[i].doc.answers;
				response[i] = res;
				
			}
		
			callback(response); // odsyłamy gołą tablicę JSONów
		
		} else callback({'status': 'error', 'message': 'nie znaleziono wyników dla ankiety ' + label});
	
	});
		
};

// potwierdzenie wyniku ankiety
Database.prototype.confirmResult = function(result, callback) {

	Database.prototype.insertResult(result, function(status) {
	
		callback(status);
	
	});

};

// usunięcie wszystkich danych z bazy
Database.prototype.reset = function() {

	TemplateModel.remove({}, function() {});
	QuestionModel.remove({}, function() {});
	UserModel.remove({}, function() {});
	PollModel.remove({}, function() {});
	ResultModel.remove({}, function() {});

};

// ----


/* Modele dokumentów
 *
 */
var Schema = mongoose.Schema;


// wynik ankiety
var Result = new Schema({
  username: String,
  password: String,
  poll: String,
  answers: []
});

mongoose.model('Result', Result);
ResultModel = mongoose.model('Result');
