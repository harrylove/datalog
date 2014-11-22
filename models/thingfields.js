Thingfields = new Mongo.Collection('thingfields');

Meteor.methods({
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
