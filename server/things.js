Meteor.publish('things', function() {
    return Things.find({ user_id: this.userId },
                       {
			   sort: { date: -1 },
                           fields: {
                               user_id: 0
                           }
                       }
                      );
});

Meteor.publish('thingfields', function() {
    return Thingfields.find({ user_id: this.userId },
			    {
				sort: { form_order: 1 },
				fields: {
				    user_id: 0
				}
			    }
			   );
});

