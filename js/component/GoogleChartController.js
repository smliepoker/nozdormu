/**
 * 用来操作google chart
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-10-25
 */
;(function (ns) {
  var TOTAL = 1440; // 一天1440分钟
  ns.GoogleChartController = Backbone.View.extend({
    events: {
      'change .date': 'date_changeHandler',
      'click .remove': 'remove_clickHandler',
      'click .visible': 'visible_clickHandler'
    },
    initialize: function () {
      this.item = this.$('.controller-item').remove();
      this.createItem();
      var target = $(this.$el.data('target'));
      this.remote = target.data('remote');
      this.type = target.data('type');
    },
    remove: function () {
      this.$('.hasDatepicker').datepicker('destroy');
      Backbone.View.prototype.remove.call(this);
    },
    createItem: function () {
      var item = this.item.clone().appendTo(this.$el);
      item.find('.date').not('.hasDatepicker')
        .val('')
        .datepicker({
          dateFormat: 'yy-mm-dd',
          minDate: -91,
          maxDate: -1
        });
      return item;
    },
    getDiffDates: function () {
      var dates = [],
          data = this.model.get('chart-data'),
          curr = data ? data.split(',') : [];
      this.$('.date').each(function () {
        if (this.value !== '' && dates.indexOf(this.value) === -1) {
          dates.push(this.value);
        }
      });
      var adds = _.difference(dates, curr),
          removes = _.difference(curr, dates);
      
      // remove lines
      if (removes.length) {
        for (var i = 0, len = removes.length; i < len; i++) {
          this.model.unset(removes[i]);
        }
        this.model.set('chart-data', _.intersection(dates, curr).join(','));
      }
      
      return adds;
    },
    handleDatesChange: function () {
      var dates = this.getDiffDates();
      if (dates.length === 0) {
        return;
      }
      var data = {
        output: 'json',
        type: this.type,
        date: dates[0]
      };
      dianjoy.service.Manager.call(this.remote, data, {
        success: this.remote_successHandler,
        context: this
      });
      this.$('.date, button').prop('disabled', true);
      this.$('.fa-calendar').toggleClass('fa-calendar fa-spinner fa-spin');
    },
    validate: function (array) {
      "use strict";
      if (array.length === TOTAL) {
        return array;
      }
      var time = '',
          format = dianjoy.utils.Datetime.formatAsHourMinute;
      for (var i = 1; i < TOTAL; i++) {
        time = format(i - 1);
        if (array[i][0] !== time) {
          array.splice(i, 0, [time, 0]);
        }
      }
      return array;
    },
    date_changeHandler: function (event) {
      if (_.all(this.$(".date"), function (item) {
        return item.value !== '';
      })) {
        this.createItem();
      }
      this.handleDatesChange();
      $(event.target).closest('.controller-item').addClass('used');
    },
    remote_successHandler: function (response) {
      var data = this.model.get('chart-data'),
          curr = data ? data.split(',') : [];
      curr.push(response.date);
      response.data = this.validate(response.data);
      this.model.set(response.date, response.data);
      this.model.set('chart-data', curr.join(','));
      this.$('.date').prop('disabled', false);
      this.$('.used button').prop('disabled', false);
      this.$('.fa-spin').toggleClass('fa-calendar fa-spinner fa-spin');
    },
    remove_clickHandler: function (event) {
      $(event.currentTarget).closest('.controller-item').remove();
      this.handleDatesChange();
    },
    visible_clickHandler: function (event) {
      var target = $(event.currentTarget),
          item = target.closest('.controller-item'),
          date = item.find('input').val(),
          isVisible = item.hasClass('blind');
      if (date === '') {
        return;
      }
      target.find('.fa-eye, .fa-eye-slash').toggleClass('fa-eye fa-eye-slash');
      item.toggleClass('blind');
      var dates = this.model.get('chart-data');
      dates = dates ? dates.split(',') : [];
      if (isVisible) {
        dates.push(date);
      } else {
        dates = _.without(dates, date);
      }
      this.model.set('chart-data', dates.join(','));
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));


