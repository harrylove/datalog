Meteor.methods({
    setUserThingSort: function(sort) {
	check(sort, Object);
	updateUserProfileField('thing_sort', sort);
    }
});

var updateUserProfileField = function(field, value) {
    var profile = Meteor.user().profile || {};
    profile[field] = value;
    Meteor.users.update(
        {
	    _id: Meteor.userId()
	},
        {
	    $set: {
		profile: profile
	    }
	}
    );
};
