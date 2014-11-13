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

Thingfields = new Mongo.Collection('thingfields');

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

validFieldTypes = [
    'String',
    'Number',
    'Date'
].sort();

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
        thing.user_id = Meteor.userId();
        Things.update(thing._id, {
	    $set: _.omit(thing, '_id')
	});
    },
    newThingfield: function(tf) {
        check(tf.label, String);
        check(tf.dtype, Match.Where(function(x) {
            return _.contains(validFieldTypes, x);
        }));
        tf.form_order = Thingfields.find().count();
        tf.user_id = Meteor.userId();
        Thingfields.insert(tf);
    },
    updateThingfieldOrder: function(id, index) {
	check(id, String);
	check(index, Number);
	Thingfields.update(id, { $set: { form_order: index }});
    },
    editThingfield: function(tf) {
        check(tf.label, String);
        check(tf.dtype, Match.Where(function(x) {
            return _.contains(validFieldTypes, x);
        }));
        Thingfields.update(tf._id, {
            $set: {
                label: tf.label,
                dtype: tf.dtype
            }
        });
    }
});
