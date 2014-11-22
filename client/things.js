Tracker.autorun(function(comp) {
    if (Meteor.user()) {
	initPerPage();
        initThingListSort();
        initThingListSkip()
	comp.stop();
    }
});

var setThingsCount = function(count) {
    Session.set('thingsCount', count);
};

var getThingsCount = function() {
    return Session.get('thingsCount');
};



// Table Skip (pagination)
var getTotalPages = function() {
    var count = getThingsCount();
    var pages = 1;
    if (count > 0) {
	pages = Math.ceil(count / getPerPage());
    }
    return pages;
};

var isCurrentPageValid = function(page) {
    console.info(skip / getPerPage(), getTotalPages());
};

var getCurrentPage = function() {
    return Math.floor(getThingListSkip() / getPerPage()) + 1;
};

var initThingListSkip = function() {
    var user = getUser();
    var skip;
    if (user.profile && user.profile.thing_skip) {
        skip = user.profile.thing_skip;
	console.info(getCurrentPage());
    } else {
        skip = calculateThingListSkip(1);
    }
    setThingListSkip(skip);
};

var calculateThingListSkip = function(page) {
    return (page - 1) * getPerPage();
};

var setUserThingListSkip = function(skip) {
    skip = calculateThingListSkip(skip);
    setThingListSkip(skip);
    Meteor.call('setUserThingSkip', skip);
};

var setThingListSkip = function(skip) {
    Session.set('list_things_pagination', skip);
};

var getThingListSkip = function() {
    return Session.get('list_things_pagination');
};



// Table Items Per Page (pagination)
var initPerPage = function() {
    var user = getUser();
    var perPage = 10;
    if (user.profile && user.profile.per_page) {
        perPage = user.profile.per_page;
    }
    setPerPage(perPage);
};

var setUserPerPage = function(perPage) {
    setPerPage(perPage);
    Meteor.call('setUserThingPerPage', perPage);
};

var setPerPage = function(perPage) {
    Session.set('thingsPerPage', perPage);
};

var getPerPage = function() {
    return Session.get('thingsPerPage');
};



// Table Sorting
var list_thing_table_sort = {};

var initThingListSort = function() {
    var user = getUser();
    var sort = { Date: -1 };
    if (user.profile && user.profile.thing_sort) {
        sort = user.profile.thing_sort;
    }
    setThingListSort(sort);
};

var setUserThingListSort = function(sort) {
    setThingListSort(sort);
    Meteor.call('setUserThingSort', sort);
};

var setThingListSort = function(sort) {
    Session.set('activeThingListSort', sort);
};

var calculateThingListSort = function(field) {
    var sort = list_thing_table_sort[field._id];
    var newSort = (sort == 1) ? -1 : 1;
    list_thing_table_sort[field._id] = newSort;
    var sortValue = {};
    sortValue[field.label] = newSort;
    return sortValue;
};

var getThingListSort = function() {
    return Session.get('activeThingListSort');
};




Tracker.autorun(function() {
    Meteor.subscribe('things', {
        sort: getThingListSort(),
        limit: getPerPage(),
	skip: getThingListSkip()
    });
    
    Meteor.call('getThingsCount', function(err, res) {
	if (!err) {
	    setThingsCount(res);
	}
    });
});

Template.list_things_table.helpers({
    thingfields: function() {
	return Thingfields.find({}, { sort: { form_order: 1 }});
    },
    things: function() {
	var perPage = getPerPage();
  	var theThings = Things.find({}, { sort: getThingListSort() }).fetch();
	var thingsArray = [];
	for (var i = 0; i < perPage; i++) {
	    thingsArray[i] = theThings[i] || null;
	}
	return thingsArray;
    },
    thingHasData: function() {
	return !_.isEmpty(this);
    },
    thingValue: function() {
        var label = Template.parentData().label;
        var dtype = Template.parentData().dtype;
        var data = Template.parentData(1)[label];
	var value;
        switch(dtype) {
        case 'Date':
            value = moment(data).format('YYYY-MM-DD');
            break;
        case 'Decimal':
            value = parseFloat(data);
            break;
        case 'Number':
            value = Math.round(parseFloat(data));
            break;
        default:
            value = data;
        }
        return value;
    },
    pages: function() {
	return _.range(1, getTotalPages() + 1);
    },
    active: function() {
	var active = '';
	if (getCurrentPage() == this.toString()) {
	    active = 'active';
	}
	return active;
    }
});

Template.list_things_table.events({
    'click thead th': function(e) {
        e.preventDefault();
        setUserThingListSort(calculateThingListSort(this));
    },
    'mouseenter thead th': function(e, tmpl) {
	$(e.target).addClass('hover');
    },
    'mouseleave thead th': function(e, tmpl) {
        $(e.target).removeClass('hover');
    },
    'click tbody tr': function(e) {
        e.preventDefault();
        setEditThing(this._id);
    },
    'click .pagination a': function(e) {
	e.preventDefault();
	setUserThingListSkip(e.target.innerText);
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

