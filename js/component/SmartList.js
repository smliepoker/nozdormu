/**
 * Created by meathill on 14-3-27.
 */
;(function (ns) {
  ns.SmartList = Backbone.View.extend({
    events: {

    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      var spec = this.$el.data();

      this.collection = new dianjoy.model.ListCollection();
      this.collection.url = spec.url;
      this.collection.once('reset', this.render, this);
      this.collection.fetch(this.model.toJSON());
    },
    render: function (collection) {
      this.$el.html(this.template({list: collection.toJSON()}));
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));