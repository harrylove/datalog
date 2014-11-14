Meteor.subscribe('thingfields');

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
            Meteor.call('newThingfield', field, function(e) {
                if (!e) {
                    tmpl.find('form').reset();
                }
            });
        }
    }
});

var getEditThingfield = function() {
    var id = Session.get('edit_thingfield');
    return Thingfields.findOne(id);
};

var setEditThingfield = function(id) {
    Session.set('edit_thingfield', id);
};

Template.edit_thingfield.helpers({
    label: function() {
        var thingfield = getEditThingfield();
        return thingfield && thingfield.label;
    },
    validFieldTypes: validFieldTypes,
    selected: function() {
        var thingfield = getEditThingfield();
        if (thingfield) {
            return thingfield.dtype == this.toString() ? 'selected' : '';
        }
    }
});

Template.edit_thingfield.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        var label = tmpl.find('#edit_label').value;
        if (label.length > 0) {
            var dtype = tmpl.find('#edit_data_type').value;
            var field = {
                _id: getEditThingfield()._id,
                label: label,
                dtype: dtype
            };
            Meteor.call('editThingfield', field);
        }
    }
});

Template.list_thingfields.rendered = function() {
    $(this.find('ol')).sortable({
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
        return Thingfields.find();
    }
});

Template.list_thingfields.events({
    'click li': function(e) {
        e.preventDefault();
        setEditThingfield(this._id);
    }
});

