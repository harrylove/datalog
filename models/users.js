Meteor.methods({
    setUserThingPerPage: function(perPage) {
	updateUserProfileField('per_page', perPage);
        return perPage;
    },
    setUserThingSort: function(sort) {
	updateUserProfileField('thing_sort', sort);
        return sort;
    },
    setUserThingSkip: function(skip) {
	updateUserProfileField('thing_skip', skip);
        return skip;
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
