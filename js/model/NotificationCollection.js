/**
 * Created by meathill on 13-12-19.
 */
;(function (ns) {
  "use strict";
  ns.NotificationCollection = Backbone.Collection.extend({
    url: 'notification/api.php',
    parse: function (response) {
      this.more = 0;
      if (response.code === 0) {
        if ('notification' in response) {
          var notification = response.notification;
          this.lastID = notification[0].id;
          this.more = notification.length;
          return notification;
        }
      }
    }
  });
}(Nervenet.createNameSpace('Dianjoy.model')));