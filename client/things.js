Meteor.startup(function() {
    Session.set('thingsPerPage', 10);
});

var list_thing_table_sort = {};

var setThingListSort = function(field) {
    var sort = list_thing_table_sort[field._id];
    var newSort = (sort == 1) ? -1 : 1;
    list_thing_table_sort[field._id] = newSort;
    var sortValue = {};
    sortValue[field.label] = newSort;
    Session.set('activeThingListSort', sortValue);
};

var getThingListSort = function() {
    return Session.get('activeThingListSort') || { Date: -1 };
};

Tracker.autorun(function() {
    Meteor.subscribe('things', {
        sort: getThingListSort(),
        limit: Session.get('thingsPerPage'),
	skip: Session.get('list_things_pagination')
    });
    
    Meteor.call('getThingsCount', function(err, res) {
	if (!err) {
	    Session.set('thingsCount', res);
	}
    });
});

Template.list_things_table.helpers({
    thingfields: function() {
	return Thingfields.find({}, { sort: { form_order: 1 }});
    },
    things: function() {
	var perPage = Session.get('thingsPerPage');
	var theThings = Things.find({}, { sort: getThingListSort() }).fetch();
	var emptyThing = {};
	_.each(Thingfields.find().fetch(), function(field) {
	    emptyThing[field] = null;
	});
	var thingsArray = [];
	for (var i = 0; i < perPage; i++) {
	    thingsArray[i] = theThings[i] || emptyThing;
	}
	return thingsArray;
    },
    thingValue: function() {
        var label = Template.parentData().label;
        var dtype = Template.parentData().dtype;
        var data = Template.parentData(1)[label];
        var value;
        switch(dtype) {
        case 'Date':
            value = data ? moment(data).format('YYYY-MM-DD') : data;
            break;
        case 'Decimal':
            value = data ? parseFloat(data) : data;
            break;
        case 'Number':
            value = data ? Math.round(parseFloat(data)) : data;
            break;
        default:
            value = data;
        }
        return value;
    },
    pages: function() {
	var thingsCount = Session.get('thingsCount');
	var pages = 1;
	if (thingsCount >= 0) {
	    var itemCount = Session.get('thingsPerPage');
            pages = Math.ceil(thingsCount / itemCount) + 1;
	}
	return _.range(1, pages);
    },
    active: function() {
	var page = Session.get('list_things_pagination');
	var active = '';
	if (page >= 0) {
	    if (page == 0) {
		page = 1;
	    } else {
		page = page / Session.get('thingsPerPage') + 1;
            }
	    active = (page == this.toString()) ? 'active' : '';
	}
	return active;
    }
});

Template.list_things_table.events({
    'click thead th': function(e) {
        e.preventDefault();
        setThingListSort(this);
    },
    'click tbody tr': function(e) {
        e.preventDefault();
        setEditThing(this._id);
    },
    'click .pagination a': function(e) {
	var skip = (e.target.innerText - 1) * Session.get('thingsPerPage');
	Session.set('list_things_pagination', skip);
    }
});

Template.new_thing.helpers({
    thingfields: function() {
	return Thingfields.find({}, { sort: { form_order: 1 }});
    },
    new_thing_template: function() {
        var template;
        switch(this.dtype) {
        case 'Date':
            template = 'new_thing_datepicker';
            break;
        default:
            template = 'new_thing_text';
        }
        return template;
    }
});

Template.new_thing.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        var thing = {};
        _.each(tmpl.findAll('input[type!=submit]'), function(input) {
            var field = input.id.replace('new_', '');
            thing[field] = input.value;
        });
        Meteor.call('newThing', thing, function(e, count) {
            if (!e) {
                tmpl.find('form').reset();
            }
        });
    }
});

Template.new_thing_datepicker.rendered = function() {
    $(this.find('.date')).datetimepicker();
};

var getEditThing = function() {
    var id = Session.get('edit_thing');
    return Things.findOne(id);
};

var setEditThing = function(id) {
    Session.set('edit_thing', id);
};

Template.edit_thing.helpers({
    thingfields: function() {
	return Thingfields.find({}, { sort: { form_order: 1 }});
    },
    edit_thing_template: function() {
        var template;
        switch(this.dtype) {
        case 'Date':
            template = 'edit_thing_datepicker';
            break;
        default:
            template = 'edit_thing_text';
        }
        return template;
    }
});

Template.edit_thing.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        var thing = getEditThing();
        _.each(tmpl.findAll('input[type!=submit]'), function(input) {
            var field = input.id.replace('edit_', '');
            thing[field] = input.value;
        });
        Meteor.call('editThing', thing, function(e) {
            if (!e) {
                tmpl.find('form').reset();
            }
        });
    }
});

Template.edit_thing_text.helpers({
    value: function() {
        var thing = getEditThing();
        return thing && thing[this.label];
    }
});

Template.edit_thing_datepicker.rendered = function() {
    $(this.find('.date')).datetimepicker();
};

Template.edit_thing_datepicker.helpers({
    value: function() {
        var thing = getEditThing();
        return thing && thing[this.label];
    }
});

