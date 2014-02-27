/**
 * Created with JetBrains PhpStorm.
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @overview 计算当前表格筛选项的总和
 * @since 2013-10-18
 */

;(function (ns) {
  "use strict";
  ns.SmartAmount = Backbone.View.extend({
    initialize: function () {
      this.model.on('change:owner change:ad change:ch change:keyword', this.content_changeHandler, this);
      this.amount = this.$('.amount');

      if (!isNaN(this.model.get('owner')) && this.model.get('owner') !== -1) {
        this.render();
      }
    },
    remove: function () {
      "use strict";
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      var self = this;
      setTimeout(function () {
        "use strict";
        var list = $('#' + self.$el.data('target')).find('tbody tr:visible'),
          count = {
            count: list.length.toString(),
            stat: 0,
            cpa: 0,
            ratio: 0,
            out: 0,
            income: 0,
            profit: 0,
            rate: 0
          };
        _.each(list, function (item) {
          var self = $(item).children();
          count.stat += Number(self[9].innerText);
          count.cpa += Number(self[10].innerText);
          count.out += Number(self[6].innerText) + Number(self[7].innerText);
          count.income += Number(self[8].innerText);
        });
        count.ratio = (count.cpa / count.stat * 100).toFixed(2);
        count.profit = (count.income * .94 - count.out * 1.2).toFixed(2);
        count.rate = count.income > 0 ? (count.profit / count.income * 100).toFixed(2) : 0;
        count.out = count.out.toFixed(2);
        count.income = count.income.toFixed(2);
        for (var prop in count) {
          self.amount.find('.' + prop).text(count[prop]);
        }
        self.amount
          .removeClass('hide')
          .children().first().text(self.model.get('ownerlabel'));
      }, 50);
    },
    content_changeHandler: function (model, value) {
      value = model.get('owner');
      if (value === -1) {
        this.$('.amount').addClass('hide');
        return;
      }
      this.render();
    }
  });
}(Nervenet.createNameSpace('Dianjoy.component')));