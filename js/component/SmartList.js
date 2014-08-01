/**
 * Created by meathill on 14-3-27.
 */
;(function (ns) {
  'use strict';

  ns.SmartList = Backbone.View.extend({
    $router: null,
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      var spec = this.$el.data()
        , path = this.$router.getPath(true);

      this.collection = new dianjoy.model.ListCollection();
      this.collection.url = spec.url + (path ? '/' + path : '');
      this.collection.once('reset', this.render, this);
      this.collection.fetch();
    },
    render: function (collection) {
      this.$el.html(this.template({list: collection.toJSON()}));
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));