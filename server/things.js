Meteor.publish('things', function(options) {
    if (this.userId) {
	var sort = options.sort;
        return Things.find(
	    { user_id: this.userId },
            {
                sort: sort,
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

Meteor.startup(function() {
    var user = Meteor.users.findOne();
    if (!_.isUndefined(user) && !_.isNull(user._id) && 0 == Things.find().count()) {
        _.each([
            {
                user_id: user._id,
		Date: moment('2014-05-06').toDate(),
                Duration: parseFloat(1)
            },
            {
                user_id: user._id,
                Date: moment('2014-02-06').toDate(),
                Duration: parseFloat(2)
            },
            {
                user_id: user._id,
                Date: moment('2014-06-06').toDate(),
                Duration: parseFloat(4)
            },
            {
                user_id: user._id,
                Date: moment('2014-07-06').toDate(),
                Duration: parseFloat(5)
            },
            {
                user_id: user._id,
                Date: moment('2014-08-06').toDate(),
                Duration: parseFloat(10)
            },
            {
                user_id: user._id,
                Date: moment('2014-09-06').toDate(),
                Duration: parseFloat(10)
            },
            {
                user_id: user._id,
                Date: moment('2014-11-06').toDate(),
                Duration: parseFloat(7.4)
            }
        ], function(thing) {
            Things.insert(thing);
        });
    }
});
