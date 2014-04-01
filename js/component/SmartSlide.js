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
      this.collection.on('remove', this.collection_removeHandler, this);
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
      this.$('.carousel-control').toggleClass('hide', this.collection.length <= 1);

      this.indicators = this.$('.carousel-indicators');
      this.slides = this.$('.carousel-inner');
    },
    collection_addHandler: function (model) {
      var indicator = this.indicators.children().last().clone()
        , item = $(Handlebars.partials['slide-item']({list: [model.toJSON()]}));
      indicator.removeClass('active').attr('data-slide-to', this.collection.length - 1);
      this.indicators.append(indicator);
      item.attr('id', 'slide-item-' + model.cid);
      this.slides.append(item);
      this.$('.carousel-control').toggleClass('hide', this.collection.length <= 1);
    },
    collection_changeHandler: function (model) {
      var item = this.$('#slide-item-' + ('id' in model.changed ? model.cid : model.id))
        , data = model.toJSON();
      data.active = item.hasClass('active') ? 'active' : '';
      item.replaceWith(Handlebars.partials['slide-item']({list: [data]}));
    },
    collection_removeHandler: function (model) {
      var item = this.$('#slide-item-' + (model.id || model.cid));
      if (item.hasClass('active')) {
        this.$el.carousel('prev');
        item.fadeOut(1000, function () {
          $(this).remove();
        });
      } else {
        item.remove();
      }
      this.indicators.children().last().remove();
      this.$('.carousel-control').toggleClass('hide', this.collection.length <= 1);
    },
    collection_resetHandler: function () {
      this.render();
    },
    collection_sortHandler: function (model, index) {
      var item = this.$('#slide-item-' + model.id)
        , now = item.index();
      if (now < index) {
        item.insertAfter(this.slides.children().eq(index));
      } else {
        item.insertBefore(this.slides.children().eq(index));
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));