Meteor.methods({
    setUserThingPerPage: function(perPage) {
	check(perPage, Number);
	updateUserProfileField('per_page', perPage);
    },
    setUserThingSort: function(sort) {
	check(sort, Object);
	updateUserProfileField('thing_sort', sort);
    },
    setUserThingSkip: function(skip) {
	check(skip, Number);
	updateUserProfileField('thing_skip', skip);
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
