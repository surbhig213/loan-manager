import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Users = new Mongo.Collection('users');
Loans = new Mongo.Collection('loans');

// Template.register.onCreated(function registerOnCreated() {
//   this.counter = new ReactiveVar(0);
// });

Template.register.events({
  'click #register-button'(event, register_template) {
    var email = register_template.find('#email').value;
    var password = register_template.find('#password').value;
    var role = register_template.find('#role').value;
    var createdAt = new Date();

    Meteor.call('users.insert', {
    	email: email, password: password, role: role, createdAt: createdAt
    }, (err, res) => {
		  if (err) {
		    alert(err);
		  } else {
		    Router.go('/loans/' + res);
		  }
		});
 } 
});

Template.login.events({
  'click #login-button'(event, login_template) {
    var email = login_template.find('#email').value;
    var password = login_template.find('#password').value;

    Meteor.call('users.login', {
    	email: email, password: password
    }, (err, res) => {
		  if (err) {
		    alert(err);
		  } else {
		    Router.go('/loans/' + res._id);
		  }
		});
 } 
});

Template.loans.helpers({
	"equals": function(a, b) {
	    return a == b;
	},

	"loggedInUserRole": function() {
	    var userid = Router.current().params.userid;
		var users = Users.find({_id: userid}).fetch();
		if(!users.length > 0)
		{
			throw new Meteor.Error('User not found. Please Signup');
		}
		else
		{
			var user = users[0];
			var role = user.role;
			switch(role)
			{
				case 'admin' : return 'admin';
				case 'lender' : return 'lender';
				case 'borrower' : return 'borrower';
				default : return "Wrong Role";
			}
		}
	},

  	"loanslist": function () {
		var userid = Router.current().params.userid;
		var users = Users.find({_id: userid}).fetch();
		var processedLoanList = [];
		if(!users.length > 0)
		{
			throw new Meteor.Error('User not found. Please Signup');
		}
		else
		{
			var user = users[0];
			var role = user.role;
			switch(role)
			{
				case 'admin' : var loans =  Loans.find().fetch();
								break;
				case 'lender' : var loans = Loans.find({
									"$or": [
						                { "lender_id": userid },
						                { "lender_id": null }
						            ]}).fetch();
								break;
				case 'borrower' : var loans = Loans.find({borrower_id: userid}).fetch();
								break;
				default : return "Wrong Role";
			}

			loans.forEach(function(loan){
									processedLoanList.push({
										'_id' : loan._id,
										'amount' : loan.amount,
										'borrower_id' : loan.borrower_id,
										'lender_id' : loan.lender_id,
										'createdAt' : loan.createdAt ? loan.createdAt.toLocaleString() : '',
										'message' : loan.message,
										'role' : role,
										'lender_username' : loan.lender_username,
										'borrower_username' : loan.borrower_username,
										'paid_on' : loan.paid_on ? loan.paid_on.toLocaleString() : ''
									})
								});
			return processedLoanList;
		}
  },
});

Template.loans.events({
  'click .payLoan'(event, template) {
   var loanid = $(this)[0]._id;

   var userid = Router.current().params.userid;
   var user = Users.find({_id: userid}).fetch();
   Loans.update({_id : loanid},{$set:{lender_id : userid, lender_username : user[0].username, paid_on : new Date()}});
   alert("Loan amount paid successfully");
 },

 'click #borrow-button'(event, template) {
    var amount = template.find('#amount').value;
    var message = template.find('#message').value;
    if(amount && message){
	    var userid = Router.current().params.userid;
	    Meteor.call('loans.insert', {
	    	amount: amount, borrower_id: userid, lender_id: null, createdAt : new Date(), message: message
	    }, (err, res) => {
			  if (err) {
			    alert(err);
			  } else {
			   //success 
			   $('#amount').val('');
			   $('#message').val('');
			   alert("Loan request created successfully");
			  }
			});
	} 
	else{
		alert("Please fill all the mandatory fields");
	}
}
});

Router.map(function(){
	this.route('register', {
		path : '/register'
	});
	this.route('login', {
		path : '/login'
	});
	this.route('root', {
		path : '/'
	});
	this.route('loans', {
		path : '/loans/:userid',
	});
});
