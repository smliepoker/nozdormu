/**
 * Created by meathill on 13-11-12.
 */
;(function (ns) {
  "use strict";
  ns.MorrisChart = Backbone.View.extend({
    initialize: function () {
      if (this.$el.is(':hidden')) {
        this.remove();
        return;
      }
      this.data = JSON.parse(this.$('script').html().replace(/,\s?]/, ']'));
      this.$('script').remove();
      if (this.data.length <= 1) {
        this.$('.placeholder').addClass('empty').text('（无数据）');
        return;
      }
      this.createOptions();
      this.drawChart();
    },
    createOptions: function () {
      var spec = this.$el.data(),
          options = _.extend({
            element: this.$('.placeholder')[0],
            lineWidth: 2
          }, spec);
      this.className = 'type' in spec ? spec.type.charAt(0).toUpperCase() + spec.type.substr(1) : 'Line';
      if ('color' in spec) {
        options.colors = options.lineColors = options.barColors = spec.color.split(',');
      } else {
        options.colors = options.lineColors = options.barColors = R.chartColors;
      }
      if (this.className === 'Donut') {
        options.formatter = function (y, data) {
          return 'percent' in data ? y + '(' + data.percent + '%)' : y;
        }
      }
      var keys = _.keys(this.data[0]);
      options.xkey = keys[0];
      options.ykeys = options.labels = keys.slice(1);
      this.options = options;
    },
    drawChart: function (data) {
      this.options.data = data || this.data;
      this.chart = new Morris[this.className](this.options);
    }
  });
}(Nervenet.createNameSpace('Dianjoy.component')));