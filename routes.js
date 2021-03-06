/**
 * This file defines the routes used in your application
 * It requires the database module that we wrote previously.
 */ 

var db = require('./database'),
	photos = db.photos,
	users = db.users;


module.exports = function(app){

	// Homepage
	app.get('/', function(req, res){
	
		res.render('home');
	});
	app.get('/Vote', function(req, res){

		photos.find({}, function(err, all_photos){



			// Find the current user
			users.find({ip: req.ip}, function(err, u){

				let voted_already = true;
				
				var voted_on = [];

				if(u.length == 1){
					voted_on = u[0].votes;
				}

				if(voted_on.length > 0){
					voted_already = false;
				}






			// Render the standings template and pass the photos
			res.render('Vote', { Vote: all_photos, hasnt_voted: voted_already });

			});
		});

	});
	app.get('/standings', function(req, res){

		photos.find({}, function(err, all_photos){

			// Sort the photos 

			all_photos.sort(function(p1, p2){
				return (p2.likes - p2.dislikes) - (p1.likes - p1.dislikes);
			});

			// Render the standings template and pass the photos
			res.render('standings', { standings: all_photos });

		});

	});

	// This is executed before the next two post requests
	app.post('*', function(req, res, next){
		
		// Register the user in the database by ip address

		users.insert({
			ip: req.ip,
			votes: []
		}, function(){
			// Continue with the other routes
			next();
		});
		
	});

	app.post('/bad', vote);
	app.post('/good', vote);

	function vote(req, res){

		// Which field to increment, depending on the path

		var what = {
			'/bad': {dislikes:1},
			'/good': {likes:1}
		};

		// Find the photo, increment the vote counter and mark that the user has voted on it.

		photos.find({ name: req.body.photo }, function(err, found){
		
			if(found.length == 1){

				photos.update(found[0], {$inc : what[req.path]});

				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
				
					res.redirect('/Vote');
				});

			}
			else{
			
				res.redirect('/Vote');
			}

		});
	}
};