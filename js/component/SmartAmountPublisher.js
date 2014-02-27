/**
 * Created with JetBrains PhpStorm.
 * User: woddy
 * Date: 13-12-18
 * Time: 下午2:03
 * To change this template use File | Settings | File Templates.
 */

;(function (ns) {
    ns.SmartAmount = Backbone.View.extend({
        events: {

        },
        initialize: function () {
            this.model.on('change:owner', this.owner_changeHandler, this);
            this.target = $('#' + this.$el.data('target'));
            this.amount = this.$('.amount');
        },
        remove: function () {
            "use strict";
            this.model.off(null, null, this);
            Backbone.View.prototype.remove.call(this);
        },
        owner_changeHandler: function (model, value) {
            value = Number(value);
            if (value === -1) {
                this.$('.amount').addClass('hide');
                return;
            }
            var list = this.model.get('table-items'),
                count = {
                    count: list.length.toString(),
                    in_num: 0,
                    out_num: 0,
                    income: 0,
                    outcome: 0,
                    profit: 0,
                };
            _.each(list, function (item) {
                var self = $(item).children();
                count.in_num += Number(self.eq(3).text());
                count.out_num += Number(self.eq(4).text());
                count.income += Number(self.eq(5).text());
                count.outcome += Number(self.eq(6).text());
            });
            count.profit = (count.income - count.outcome) * 0.94;
            count.profit = count.profit.toFixed(2);
            for (var prop in count) {
                this.amount.find('.' + prop).text(count[prop]);
            }
            this.amount
                .removeClass('hide')
                .children().first().text(this.model.get('ownerlabel'));
        }
    });
}(Nervenet.createNameSpace('Dianjoy.component')));
