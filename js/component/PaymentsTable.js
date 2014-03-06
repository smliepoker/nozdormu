/**
 * Created by meathill on 13-12-26.
 */
;(function (ns) {
  "use strict";
  ns.PaymentsTable = Backbone.View.extend({
    initialize: function () {
      this.classes = this.$el.data('classes');
      this.model.on('change:label-id', this.model_changeHandler, this);
    },
    model_changeHandler: function (model, value) {
      var target = this.$('#label-' + value),
          result = '',
          classes = this.classes.split(' ');
      target.removeClass(this.classes).addClass(model.get('class'))
        .find('span').text(model.get('rmb') / 100);

      target.siblings().add(target).each(function () {
        result = result.concat(_.intersection(this.className.split(' '), classes));
      });
      target.closest('tr').removeClass(this.classes).addClass(_.unique(result).join(' '));

      this.model.unset('label-id', {silent: true});
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));