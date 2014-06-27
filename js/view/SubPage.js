(function (ns) {
  'use strict';
  var eventsMap = {
    'click .face': 'face_clickHandler',
    'click .alert .close': 'alert_closeHandler',
    'click .print-button': 'printHandler',
    'click .export-button': 'exportHandler',
    'change .check-all': 'checkAll_changeHandler',
    'change .check-other': 'checkOther_clickHandler',
    'change .toggle': 'toggle_changeHandler'
  };

  ns.SubPage = Backbone.View.extend({
    $context: null,
    events: eventsMap,
    initialize: function () {
      this.model.on('change:form', this.modelForm_changeHandler, this);
    },
    clear: function () {
      dianjoy.popup.Manager.off();
      dianjoy.component.Manager.clear(this.$el);
      this.model.clear({silent: true});
      this.$el.empty();
    },
    initComponents: function () {
      dianjoy.component.Manager.check(this.$el, this.model);
    },
    load: function (url, data) {
      this.setDisabled(true);
      this.clear();
      this.$el.load(url, _.bind(this.loadCompleteHandler, this));
      if (_.isObject(data)) {
        this.model.set(data);
      } else {
        this.model.set({
          id: data
        });
      }
      this.trigger('load:start', url);
      ga('send', 'pageview', url);
    },
    setDisabled: function (bl) {
      this.$('a.btn').addClass('disabled');
      this.$('button').prop('disabled', bl);
    },
    alert_closeHandler: function (event) {
      var target = $(event.currentTarget).parent();
      if (target.hasClass('media')) {
        var data = {
          m: 'read_all_message',
          id: $(target).attr('id')
          };
        dianjoy.service.Manager.call('user/action_user.php', data);
        return;
      }
      if (!target.hasClass('ad')) {
        return;
      }
      var flag = target.attr('className').match(/noad-\d+/)[0];
      dianjoy.component.model.Cookie.getInstance().add('no-ad', flag);
    },
    checkAll_changeHandler: function (event) {
      var target = event.currentTarget;
      this.$('[type=checkbox][name="' + target.alt + '[]"]').prop('checked', target.checked);
    },
    checkOther_clickHandler: function (event) {
      var table = this.$($(event.currentTarget).attr('data-target'));
      table.find('input[type=checkbox]').not('.check-all').prop('checked', function (i, checked) {
        return !checked;
      });
    },
    face_clickHandler: function(event) {
      var img = $(event.currentTarget).clone();
      img.removeClass('preview img-polaroid');
      dianjoy.popup.Manager.popup(img.attr('alt'), img[0].outerHTML, false);
    },
    modelForm_changeHandler: function (model, value) {
      if (!value) {
        return;
      }
      this.$('.alert')
        .hide()
        .removeClass('alert-success alert-danger')
        .addClass('alert-' + value.className)
        .text(value.msg)
        .slideDown();
      this.$('input, select, button').prop('disabled', false);
    },
    toggle_changeHandler: function (event) {
      var target = $(event.currentTarget),
          classes = target.data('toggle-class').split(' ');
      this.$('.' + classes.join(', .')).toggleClass('hide');
      dianjoy.component.model.Cookie.getInstance().toggle('toggle', classes);
    },
    loadCompleteHandler: function (response, status) {
      if (status === 'error') {
        this.trigger('load:failed');
      } else {
        this.initComponents();
      }
      this.trigger('load:complete');
    },
    exportHandler: function (event) {
      this.$context.trigger('create-excel', this.$el, '广告数据', event.currentTarget);
    },
    printHandler: function (event) {
      window.print();
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('dianjoy.view')));
