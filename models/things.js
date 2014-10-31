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
    'Number'
];

Meteor.methods({
    newThingfield: function(tf) {
        check(tf.label, String);
        check(tf.dtype, String);
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
    }
});
