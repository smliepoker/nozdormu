/**
 * Created by meathill on 13-12-5.
 */
;(function (ns) {
  "use strict";
  var interval = 0,
      TIMEOUT = 60000;
  ns.NotificationPanel = Backbone.View.extend({
    events: {
      'click input': 'checkbox_clickHandler',
      'change input': 'checkbox_changeHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());

      this.collection.once('sync', this.collection_initHandler, this);
      this.collection.fetch();
    },
    render: function (collection) {
      collection = collection || this.collection.toJSON();
      var html = this.template({notification: collection});
      $(html).insertAfter(this.$('.alarms .title'));
    },
    refresh: function () {
      this.collection.fetch({
        data: {from: this.collection.lastID},
        remove: false,
        at: 0
      });
    },
    seekAttention: function () {
      var icon = this.$('.my-alarm');
      icon.addClass('animated swing time2x');
      setTimeout(function () {
        icon.removeClass('swing time2x');
      }, 2000);
    },
    checkbox_changeHandler: function (event) {
      var target = $(event.currentTarget),
          index = target.parent().index() - 1;
      this.collection.at(index).save({status: target.prop('checked') ? 1 : 0}, {
        patch: true,
        success: _.bind(this.model_saveSuccessHandler, this),
        error: _.bind(this.model_saveErrorHandler, this)
      });
    },
    checkbox_clickHandler: function (event) {
      event.stopPropagation();
    },
    collection_initHandler: function (collection) {
      if (collection.length > 0) {
        $(' <span class="badge">' + collection.length + '</span>').insertAfter(this.$('.my-alarm'));
        this.seekAttention();
        this.render();
      }
      collection.on('sync', this.collection_syncHandler, this);
      interval = setTimeout(_.bind(this.refresh, this), TIMEOUT);
    },
    collection_syncHandler: function (collection, response, options) {
      if (collection === this.collection) {
        if (collection.more > 0) {
          this.$('.alarms').siblings().find('.badge').text(collection.length);
          this.render(_.map(collection.initial(collection.more), function (model) {
            return model.toJSON();
          }));
          this.seekAttention();

          ns.Manager.createNotification();
        }
        interval = setTimeout(_.bind(this.refresh, this), TIMEOUT);
      }
    },
    model_saveSuccessHandler: function (model, response) {
      this.collection.remove(model);
      this.$('.alarms').siblings().find('.badge').text(this.collection.length);
      console.log(model, response);
    },
    model_saveErrorHandler: function (model, xhr, options) {
      console.log(model);
    }
  });
}(Nervenet.createNameSpace('Dianjoy.notification')));