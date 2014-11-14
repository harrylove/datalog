Things = new Mongo.Collection('things');

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
    newThing: function(thing) {
	var fields = Thingfields.find().fetch();
        _.each(fields, function(field) {
	    var value = thing[field.label];
            switch(field.dtype) {
            case 'Number':
                check(parseFloat(value), Number);
                break;
	    case 'Date':
		check(value, Match.Where(function(v) {
                    return moment(v, 'YYYY-MM-DD').isValid();
                }));
		break;
	    default:
                check(value, String);
            }
        });
        thing.user_id = Meteor.userId();
        Things.insert(thing);
    },
    editThing: function(thing) {
	var fields = Thingfields.find().fetch();
        _.each(fields, function(field) {
	    var value = thing[field.label];
            switch(field.dtype) {
            case 'Number':
                check(parseFloat(value), Number);
                break;
	    case 'Date':
                check(value, Match.Where(function(v) {
                    return moment(v, 'YYYY-MM-DD').isValid();
                }));
		break;
            default:
                check(value, String);
            }
        });
        Things.update(thing._id, {
	    $set: _.omit(thing, '_id')
	});
    }
});
