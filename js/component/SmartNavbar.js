;(function (ns) {
  'use strict';
  function dateStart_closeHandler(selectDate) {
    var end = $(this).siblings('.date.end');
    end.datepicker('setDate', dianjoy.utils.getMinDate(30, selectDate, end.val()));
  }
  function dateEnd_closeHandler(selectDate) {
    var start = $(this).siblings('.date.start');
    start.datepicker('setDate', dianjoy.utils.getMaxDate(-30, selectDate, start.val()));
  }
  var init = {
    events: {
      'click .filter a': "filter_clickHandler",
      'click .table-filter a': 'tableFilter_clickHandler',
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
      if (this.model.get('owner') > 0) {
        var owner = this.$('[href=#owner]');
        if (owner.length > 0) {
          owner = this.model.get('owner');
          this.addLabelTo('owner-' + owner);
          this.model.set('ownerlabel', this.$('[href=#owner-' + owner + ']').text());
        }
      }
      var show = this.model.get('show');
      if (show) {
        show = show.split(' ');
        for (var i = 0, len = show.length; i < len; i++) {
          this.addLabelTo(show[i]);
        }
      }
      var form = this.$('.keyword-form');
      if (form.length > 0) {
        var input = form[0].elements.query;
        input.value = this.model.get('keyword') || '';
        input.select();
      }
    },
    addLabel: function (label, parent) {
      parent.find('.curr').remove();
      if (!label) {
        return;
      }
      var label = $('<span class="curr">' + label + '</span>');
      if (parent.find('.caret').length > 0) {
        label.insertBefore(parent.find('.caret'));
      } else {
        parent.append(label);
      }
    },
    addLabelTo: function (key) {
      var a = this.$('[href=#' + key + ']');
      a.parent().addClass('active')
        .siblings().removeClass('active');
      this.addLabel(a.text(), a.closest('.dropdown-menu').siblings());
    },
    autoSubmit_Handler: function (event) {
      $(event.currentTarget).closest('form').submit();
    },
    filter_clickHandler: function (event) {
      var href = event.target.href,
          className = href.substr(href.indexOf('#') + 1),
          parent = $(event.target).parent(),
          currentClasses = this.model.get('show'),
          group = $(event.target).closest('.filter').attr('data-group').split(' ');
      currentClasses = currentClasses ? currentClasses.split(' ') : [];
      parent.addClass('active')
        .siblings().removeClass('active');
      currentClasses = _.difference(currentClasses, group);
      if (className) {
        currentClasses.push(className);
      }
      this.model.set('show', currentClasses.join(' '));
      this.addLabel(className ? event.currentTarget.innerText : '', parent.closest('.dropdown-menu').siblings('.dropdown-toggle'));
      event.preventDefault();
    },
    tableFilter_clickHandler: function (event) {
      var target = $(event.currentTarget),
          filter = target.attr('href').match(/#(\w+)\-?(\d+)?/);
      filter[2] = isNaN(filter[2]) ? -1 : Number(filter[2]);
      var obj = {};
      obj[filter[1]] = filter[2];
      obj[filter[1] + 'label'] = filter[2] === -1 ? '-' : target.text();
      this.model.set(obj);
      target.parent().addClass('active')
        .siblings().removeClass('active');
      var label = filter[2] !== -1 ? target.text() : '';
      this.addLabel(label, target.closest('.dropdown-menu').siblings('.dropdown-toggle'));

      event.preventDefault();
    }
  };
  ns.SmartNavbar = Backbone.View.extend(init);
}(Nervenet.createNameSpace('dianjoy.component')));
