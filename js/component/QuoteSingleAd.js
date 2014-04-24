/**
 * Created with JetBrains PhpStorm.
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @overview
 * @since 13-10-21 下午6:27
 */
;(function (ns) {
  var rate = 10000;
  ns.QuoteSingleAd = Backbone.View.extend({
    events: {
      'keyup input': 'input_changeHandler',
      'change input': 'input_changeHandler'
    },
    initialize: function () {
      this.$('tbody tr').each(function () {
        var price = Number($(this).find('.price').val()),
            num = Number($(this).find('.cpa').val());
        $(this).children().last().text(price * num);
      });

      this.interval = setInterval(_.bind(this.sync, this), rate);
    },
    remove: function () {
      clearInterval(this.interval);
      Backbone.View.prototype.remove.call(this);
    },

    sync: function () {
    var cpas = [],
        modified = $('.modified');
      if (modified.length == 0 || this.$el.hasClass('syncing')) {
        return;
      }
      modified.each(function () {
        var self = $(this);
        cpas.push({
          date: self.children().first().text(),
          num: self.find('.cpa').val(),
          rmb: self.find('.price').val()
        })
        self.removeClass('modified');
      });
      dianjoy.service.Manager.call('ad/action_ad.php', {
        m: 'quote_ad',
        adid: this.$el.data('id'),
        date_start: this.$el.data('start'),
        date_end: this.$el.data('end'),
        modified: cpas
      }, {
        success: this.remote_successHandler,
        context: this
      });
      this.$el.addClass('syncing');
    },
    input_changeHandler: function (event) {
      if (event.type === 'keyUp' && (event.keyCode < 48 || event.keyCode > 57 && event.keyCode < 96 || event.keyCode > 105)) {
        return;
      }
      var tr = $(event.currentTarget).closest('tr'),
          cpa = Number(tr.find('.cpa').val());
      tr.addClass('modified')
        .children().last().text(cpa * Number(tr.find('.price').val()));
    },
    remote_successHandler: function () {
      this.$el.removeClass('syncing');
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));