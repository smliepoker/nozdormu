;(function (ns) {
  'use strict';
  function dateStart_closeHandler(selectDate) {
    var end = $(this).siblings('.date.end');
    end.datepicker('setDate', moment(selectDate).add('days', 30).format('YYYY-MM-DD'));
  }
  function dateEnd_closeHandler(selectDate) {
    var start = $(this).siblings('.date.start');
    start.datepicker('setDate', moment(selectDate).subtract(30).format('YYYY-MM-DD'));
  }
  var init = {
    events: {
      'change .auto-submit': 'autoSubmit_Handler'
    },
    initialize: function () {
      // 日期选择
      this.$('.date').each(function() {
        var onClose = $(this).hasClass('start') ? dateStart_closeHandler : null,
            onClose = onClose || ($(this).hasClass('end') ? dateEnd_closeHandler : null),
            init = {
              dateFormat: $(this).data('format') || 'yy-mm-dd',
              minDate: this.min || -90,
              maxDate: 0,
              onClose: onClose
            };
        $(this).datepicker(init);
      });

      this.render();
    },
    remove: function () {
      this.$('.hasDatepicker').datepicker('destroy');
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.keyword-form').find('[name=query]').val(this.model.get('keyword'));
    },
    autoSubmit_Handler: function (event) {
      $(event.currentTarget).closest('form').submit();
    }
  };
  ns.SmartNavbar = Backbone.View.extend(init);
}(Nervenet.createNameSpace('dianjoy.component')));
