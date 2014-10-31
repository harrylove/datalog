Meteor.subscribe('things');
Meteor.subscribe('thingfields');

Template.list_things.helpers({
    thingfields: function() {
	return Thingfields.find({}, { $sort: { form_order: 1 }});
    },
    things: function() {
	return Things.find();
    },
    thingValue: function() {
	return Template.parentData(1)[Template.parentData().label];
    }
});

Template.new_thingfield.helpers({
    validFieldTypes: validFieldTypes
});

Template.new_thingfield.events({
    'submit form': function(e, tmpl) {
	e.preventDefault();
	var label = tmpl.find('#label').value;
	if (label.length > 0) {
	    var dtype = tmpl.find('#data_type').value;
            var field = {
                label: label,
                dtype: dtype
            };
            Meteor.call('newThingfield', field);
	    tmpl.find('#label').value = '';
        }
    }
});

Template.list_thingfields.rendered = function() {
    $(this.find('ol')).sortable({
	axis: 'y',
	stop: function(e, ui) {
	    var item = ui.item.get(0);
	    var next = ui.item.next().get(0);
            var prev = ui.item.prev().get(0);
            var index;
	    if (!prev) {
		// first item in the list
		var nextDex = Blaze.getData(next).form_order;
                index = nextDex - 1;
            } else if (!next) {
		// last item in the list
		var prevDex = Blaze.getData(prev).form_order;
                index = prevDex + 1;
            } else {
		// between items
		var prevDex = Blaze.getData(prev).form_order;
                var nextDex = Blaze.getData(next).form_order;
        	index = (prevDex + nextDex) / 2;
            }
	    Meteor.call('updateThingfieldOrder', Blaze.getData(item)._id, index);
	}
    });
};

Template.list_thingfields.helpers({
    thingfields: function() {
	return Thingfields.find({}, { sort: { form_order: 1 }});
    }
});

