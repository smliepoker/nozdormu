/**
 * 用于在页面中生成google 图表
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-10-24
 */
;(function (ns) {
  var timeout = 0,
      NODE_ID = 'google-api';
  ns.GoogleChart = Backbone.View.extend({
    initialize: function () {
      this.createOptions();
      this.data = JSON.parse(this.$('script').remove().html().replace(/,\s?]/, ']'));
      this.model.on('change:chart-data', this.model_changeHandler, this);
      this.getTime = dianjoy.utils.Datetime.formatAsHourMinute;
      if (!this.data) {
        return;
      }

      // 已经加载Google Chart库
      if ('google' in window && 'visualization' in google) {
        this.render();
        return;
      }
      // 等待加载或尚需加载
      if (!document.getElementById(NODE_ID)) {
        // 延迟加载Google Chart API
        var script = document.createElement('script');
        script.src = '//www.google.com/jsapi';
        script.id = NODE_ID;
        script.onload = function() {
          google.load('visualization', '1.0', {
            packages: ['corechart'],
            callback: function() {
              dianjoy.utils.trigger('google:ready');
            }
          });
        };
        document.head.appendChild(script);
      }
      dianjoy.utils.once('google:ready', this.render, this);
    },
    remove: function () {
      Backbone.View.prototype.remove.call(this);
      this.model.off(null, null, this);
    },
    render: function (data) {
      data = this.validData(data || this.data);
      var method = this.options.type === 'column' ? 'ColumnChart' : 'LineChart',
          chart = new google.visualization[method](this.$('.google-chart-container')[0]);
      chart.draw(data, _.omit(this.options, 'type'));
      this.chart = chart;

      if (this.refresh) {
        clearTimeout(timeout);
        timeout = setTimeout(_.bind(this.fetchData, this), this.refresh * 1000);
      }
    },
    addHistoryData: function (dates) {
      var dates = dates || this.model.get('chart-data');
      if (!dates) {
        return;
      }
      dates = dates.split(',');
      var history = [],
          keys = this.data[0].concat(dates),
          data = [keys];
      for (var i = 0, len = dates.length; i < len; i++) {
        history.push(this.model.get(dates[i]));
      }
      // 拼装数据
      var min = this.data[0].length,
          length = this.data.length;
      for (i = 1, len = this.minLength; i < len; i++) {
        var arr = [];
        for (var h = 0, hlen = history.length; h < hlen; h++) {
          if (history[h].length > i) {
            arr = arr.concat(history[h][i].slice(1));
          } else {
            var empty = [];
            empty.length = history[h][0].length - 1;
            arr = arr.concat(empty);
          }
        }
        var base = i < length ? this.data[i] : [this.getTime(i)];
        base.length = min;
        data[i] = base.concat(arr);
      }
      return data;
    },
    createOptions: function () {
      var spec = this.$el.data(),
          options = {
            backgroundColor: 'none',
            height: spec.height || 300,
            titlePosition: 'none',
            chartArea: {
              left: spec.left || '5%',
              width: spec.width || '95%'
            },
            legend: {
              position: spec.legend || 'top'
            },
            lineWidth: spec.lineWidth || 2,
            hAxis: {
              textPosition: spec.haxis || 'out',
              showTextEvery: spec.showTextEvery || 1
            }
          };
      if ('chartTop' in spec) {
        options.chartArea.top = spec.chartTop;
      }
      if ('chartHeight' in spec) {
        options.chartArea.height = spec.chartHeight;
      }
      options.type = spec.type;
      this.options = options;
      
      if ('refresh' in spec) {
        this.refresh = spec.refresh;
        this.remote = spec.remote;
      }
      if ('minLength' in spec) {
        this.minLength = Number(spec.minLength);
      }
      this.type = spec.type;
    },
    fetchData: function () {
      var data = {
        type: this.type,
        output: 'json'
      };
      dianjoy.service.Manager.call(this.remote, data, this.remote_successHandler, this.remote_errorHandler, this);
    },
    validData: function (data) {
      if (this.minLength && this.minLength > data.length - 1) {
        var min = data[0].length,
            format = dianjoy.utils.Datetime.formatAsHourMinute;
        for (var i = data.length, len = this.minLength; i < len; i++) {
          var sample = [format(i)];
          sample.length = min;
          data.push(sample.concat());
        }
      }
      return google.visualization.arrayToDataTable(data);
    },
    model_changeHandler: function (model, value) {
      var data = this.addHistoryData(value);
      this.render(data);
    },
    remote_errorHandler: function (error) {
      this.model.set('form', {
        className: 'error',
        msg: '读取最近数据失败'
      });
    },
    remote_successHandler: function (response) {
      this.data = response.data;
      var data = this.addHistoryData();
      this.render(data);
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));

