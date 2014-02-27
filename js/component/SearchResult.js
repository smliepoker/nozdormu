/**
 * 格式化显示数据
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-08-16
 */
;(function (ns) {
  ns.SearchResult = Backbone.View.extend({
    events: {
      'click .close': 'closeButton_clickHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script.template').html());
      this.model.on('change:search', this.model_changeHandler, this);
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
    },
    closeButton_clickHandler: function () {
      this.$el.slideUp();
      this.model.set('search', null);
    },
    model_changeHandler: function (model, value) {
      if (value === null) {
        return;
      }
      this.$('tbody').html(this.template(value));
      this.$el.removeClass('hide').slideDown();
    }
  });
}(Nervenet.createNameSpace('Dianjoy.component')));

