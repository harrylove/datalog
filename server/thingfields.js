Meteor.publish('thingfields', function() {
    if (this.userId) {
        return Thingfields.find({ user_id: this.userId },
                                {
                                    sort: { form_order: 1 },
                                    fields: {
                                        user_id: 0
                                    }
                                }
                               );
    }
    
});

Meteor.startup(function() {
    var user = Meteor.users.findOne();
    if (!_.isUndefined(user) && !_.isNull(user._id) && 0 == Thingfields.find().count()) {
	console.log(user);
	console.log(user._id);
        _.each([
            {
                user_id: user._id,
                label: 'Duration',
		dtype: 'Number'
            },
            {
                user_id: user._id,
                label: 'Date',
                dtype: 'Date'
            }
        ], function(thingfield) {
	    Thingfields.insert(thingfield);
        });
    }
});
