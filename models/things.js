Things = new Mongo.Collection('things');

var validateThing = function(thing) {
    var fields = Thingfields.find().fetch();
    _.each(fields, function(field) {
        var value = thing[field.label];
        switch(field.dtype) {
        case 'Number':
            value = parseFloat(value);
            check(value, Number);
            thing[field.label] = value;
            break;
        case 'Date':
            value = moment(value);
            check(value, Match.Where(function(v) {
                return v.isValid();
            }));
            thing[field.label] = value.format(x);
            break;
        default:
            check(value, String);
        }
    });
    return thing;
};

Meteor.methods({
    newThing: function(thing) {
	thing = validateThing(thing);
        thing.user_id = Meteor.userId();
        Things.insert(thing);
    },
    editThing: function(thing) {
        thing = validateThing(thing);
        Things.update(thing._id, {
            $set: _.omit(thing, '_id')
        });
    }
});
