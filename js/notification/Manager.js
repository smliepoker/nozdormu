/**
 * Created by meathill on 13-12-23.
 */
;(function (ns) {
  "use strict";
  var hidden = 'hidden';
  if ('webkitHidden' in document) {
    hidden = 'webkitHidden';
  } else if ('mozHidden' in document) {
    hidden = 'mozHidden';
  } else if ('msHidden' in document) {
    hidden = 'msHidden';
  }

  var TIMEOUT = 8000;

  ns.Manager = new (Backbone.View.extend({
    init: function (options) {
      this.setElement($(options.el));
      this.collection = options.collection;
      this.template = Handlebars.compile(this.$('.template').remove().html());

      if ('webkitNotifications' in window && webkitNotifications.checkPermission() !== 0) {
        webkitNotifications.requestPermission();
      }
    },
    render: function (data) {
      var item = $(this.template(data))
      this.$el.append(item);
      item.slideDown();

      setTimeout(function () {
        item.slideUp(function () {
          $(this).remove();
        });
      }, TIMEOUT);
    },
    createNotification: function () {
      var content = this.collection.more > 1 ? {
        id: this.collection.lastID,
        number: this.collection.more
      } : this.collection.at(0).toJSON();
      this.render(content);
      if (document[hidden] && 'webkitNotifications' in window && webkitNotifications.checkPermission() === 0) {
        webkitNotifications.createNotification('../img/logo.png', '点乐后台通知', '收到' + this.collection.more + '条通知，请及时处理哟。');
      }
    }
  }))();
}(Nervenet.createNameSpace('Dianjoy.notification')));