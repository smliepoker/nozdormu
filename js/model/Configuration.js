/**
 * Created by meathill on 13-12-24.
 */
;(function (ns) {
  "use strict";
  var LOCAL_NAME = 'Dianjoy-config';
  ns.Configuration = Backbone.Model.extend({
    initialize: function () {
      this.fetch();

      this.on('change', this.changeHandler, this);
    },
    fetch: function () {
      var item = localStorage.getItem(LOCAL_NAME);
      if (item) {
        this.set(JSON.parse(item), {silent: true});
      }
    },
    save: function () {
      var data = JSON.stringify(this.toJSON());
      localStorage.setItem(LOCAL_NAME, data);
    },
    changeHandler: function () {
      this.save();
    }
  });
}(Nervenet.createNameSpace('Dianjoy.config')));