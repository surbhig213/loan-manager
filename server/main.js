import { Meteor } from 'meteor/meteor';

Users = new Mongo.Collection('users');
Loans = new Mongo.Collection('loans');

Meteor.startup(() => {
  // // code to run on server at startup
  //Clear database if required
  // Users.remove({});
  // Loans.remove({});

});

// Insert User In DB
Meteor.methods({
	'users.insert'({email, password, role, createdAt}){

		var users = Users.find({username: email}).fetch()
		if(users.length > 0)
		{
			throw new Meteor.Error('User exists already. Please login');
		}
		else
		{
			return Users.insert({
		    	username: email,
		    	password: password,
		    	role: role,
		    	createdAt: createdAt
	   		});
		}
	}
});

// Lgin User
Meteor.methods({
	'users.login'({email, password}){
		var users = Users.find({username: email, password: password}).fetch()
		if(!users.length > 0)
		{
			throw new Meteor.Error('User not found. Please Signup');
		}
		else
		{
			return users[0];
		}
	}
});

// Create a new loan in db
Meteor.methods({
	'loans.insert'({amount, borrower_id, lender_id, createdAt, message}){
		var user = Users.find({_id: borrower_id}).fetch();
			return Loans.insert({
		    	amount: amount,
		    	borrower_id: borrower_id,
		    	lender_id: lender_id,
		    	createdAt: createdAt,
		    	message: message,
		    	borrower_username: user[0].username
	   		});
		
	}
});

