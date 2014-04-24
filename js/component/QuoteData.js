/**
 * Created with JetBrains PhpStorm.
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @overview
 * @since 13-10-21 下午5:49
 */
;(function (ns) {
  var rate = 10000;
  ns.QuoteData = Backbone.View.extend({
    events: {
      'textInput input': 'input_changeHandler',
      'change input': 'input_changeHandler'
    },
    initialize: function () {
      this.interval = setInterval(_.bind(this.sync, this), rate);
    },
    remove: function () {
      clearInterval(this.interval);
      Backbone.View.prototype.remove.call(this);
    },
    sync: function () {
      var cpas = [],
          modified = this.$('.modified');
      if (modified.length === 0 || this.$el.hasClass('syncing')) {
        return;
      }
      modified.each(function () {
        var self = $(this);
        cpas.push({
          id: this.id,
          num: self.find('.cpa').val(),
          rmb: self.find('.price').val()
        });
        self.removeClass('modified');
      });
      dianjoy.service.Manager.call('./ad/action_ad.php', {
        m: 'quote',
        date_start: this.$el.data('date'),
        modified: cpas
      }, {
        success: this.remote_successHandler,
        context: this
      });
      this.$el.addClass('syncing');
    },
    input_changeHandler: function (event) {
      $(event.currentTarget).closest('tr').addClass('modified');
    },
    remote_successHandler: function () {
      this.$el.removeClass('syncing');
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));