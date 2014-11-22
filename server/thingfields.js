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

Thingfields.allow({
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

Thingfields.deny({
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
