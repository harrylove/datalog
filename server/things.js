Meteor.publish('things', function(options) {
    var sort = options.sort || { Date: -1 };
    var limit = options.limit || 10;
    if (this.userId) {
	return Things.find({ user_id: this.userId },
                           {
                               sort: sort,
			       limit: limit,
                               fields: {
                                   user_id: 0
                               }
                           }
                          );
    }
    
});

Meteor.startup(function() {
    var user = Meteor.users.findOne();
    if (!_.isUndefined(user) && !_.isNull(user._id) && 0 == Things.find().count()) {
        _.each([
            {
                user_id: user._id,
                Date: '2014-05-06',
                Duration: 1
            },
            {
                user_id: user._id,
                Date: '2014-06-06',
                Duration: 2
            },
            {
                user_id: user._id,
                Date: '2014-06-07',
                Duration: 4
            },
            {
                user_id: user._id,
                Date: '2014-05-06',
                Duration: 5
            },
            {
                user_id: user._id,
                Date: '2014-10-06',
                Duration: 10
            },
            {
                user_id: user._id,
                Date: '2014-07-11',
                Duration: 10
            },
            {
                user_id: user._id,
                Date: '2014-08-12',
                Duration: 7.4
            },
            {
                user_id: user._id,
                Date: '2014-11-09',
                Duration: 3.4
            },
            {
                user_id: user._id,
                Date: '2014-12-06',
                Duration: 1.2
            },
            {
                user_id: user._id,
                Date: '2014-02-23',
                Duration: 5
            },
            {
                user_id: user._id,
                Date: '2014-09-23',
                Duration: 20
            },
            {
                user_id: user._id,
                Date: '2014-05-16',
                Duration: 3.4
            },
        ], function(thing) {
            Things.insert(thing);
        });
    }
});
