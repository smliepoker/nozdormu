/**
 * Created by meathill on 14-3-31.
 */
;(function (ns) {
  ns.SmartSlide = Backbone.View.extend({
    events: {

    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('#slide-template').remove().html());
      Handlebars.registerPartial('slide-item', this.$('#item-template').remove().html());
      var spec = this.$el.data();
      this.collection = dianjoy.model.ListCollection.createInstance(null, {
        url: spec.url
      });
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('destroy', this.collection_destroyHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('sort', this.collection_sortHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
      this.collection.fetch(this.model.toJSON());
    },
    remove: function () {
      this.collection.off();
      dianjoy.model.ListCollection.destroyInstance(this.collection.url);
    },
    render: function () {
      if (this.collection.length === 0) {
        return;
      }
      var list = this.collection.toJSON();
      list[0].active = 'active';
      this.$el
        .prepend(this.template({list: list}))
        .addClass('slide carousel')
        .carousel();
    },
    collection_addHandler: function (model) {
      this.$('.carousel-inner').append(this.template({list: [model.toJSON()]}));
    },
    collection_changeHandler: function (model) {
      this.$('#slide-item-' + model.id).replaceWith(Handlebars.partials['slide-item']({list: [model.toJSON()]}));
    },
    collection_destroyHandler: function (model) {
      this.$('#slide-item-' + model.id).remove();
    },
    collection_resetHandler: function () {
      this.render();
    },
    collection_sortHandler: function (model, index) {
      var item = this.$('#slide-item-' + model.id)
        , now = item.index();
      if (now < index) {
        item.insertAfter(this.$('.carousel-inner').children().eq(index));
      } else {
        item.insertBefore(this.$('.carousel-inner').children().eq(index));
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));