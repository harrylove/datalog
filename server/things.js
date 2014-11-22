Meteor.publish('things', function(options) {
    if (this.userId) {
	var sort = options.sort || { Date: -1 };
        var limit = options.limit || 10;
        var skip = options.skip || 0;
        return Things.find({ user_id: this.userId },
                           {
                               sort: sort,
			       limit: limit,
			       skip: skip,
                               fields: {
                                   user_id: 0
                               }
                           }
                          );
    }
    
});

Things.allow({
    insert: function (user_id, doc) {
        return (user_id && doc.user_id === user_id);
    },
    update: function (user_id, doc, fields, modifier) {
        return doc.user_id === user_id;
    },
    remove: function (user_id, doc) {
        return doc.user_id === user_id;
    },
    fetch: ['user_id']
});

Things.deny({
    update: function (user_id, docs, fields, modifier) {
        return _.contains(fields, 'user_id');
    },
    remove: function (user_id, doc) {
        return doc.deleted;
    },
    fetch: ['deleted']
});

Meteor.methods({
    getThingsCount: function() {
	var count = 0;
	if (this.userId) {
	    count = Things.find({ user_id: this.userId }).count();
	}
	return count;
    }
});

Meteor.startup(function() {
    var user = Meteor.users.findOne();
    if (!_.isUndefined(user) && !_.isNull(user._id) && 0 == Things.find().count()) {
        _.each([
            {
                user_id: user._id,
                Date: '2014-05-06',
                Duration: '1'
            },
            {
                user_id: user._id,
                Date: '2014-06-06',
                Duration: '2'
            },
            {
                user_id: user._id,
                Date: '2014-06-07',
                Duration: '4'
            },
            {
                user_id: user._id,
                Date: '2014-05-06',
                Duration: '5'
            },
            {
                user_id: user._id,
                Date: '2014-10-06',
                Duration: '10'
            },
            {
                user_id: user._id,
                Date: '2014-07-11',
                Duration: '10'
            },
            {
                user_id: user._id,
                Date: '2014-08-12',
                Duration: '7.4'
            },
            {
                user_id: user._id,
                Date: '2014-11-09',
                Duration: '3.4'
            },
            {
                user_id: user._id,
                Date: '2014-12-06',
                Duration: '1.2'
            },
            {
                user_id: user._id,
                Date: '2014-02-23',
                Duration: '5'
            },
            {
                user_id: user._id,
                Date: '2014-09-23',
                Duration: '20'
            },
            {
                user_id: user._id,
                Date: '2014-05-16',
                Duration: '3.4'
            },
        ], function(thing) {
            Things.insert(thing);
        });
    }
});
