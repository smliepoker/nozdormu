/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
;(function (ns) {
  'use strict';
  var popup
    , editor;

  var NormalAlertPopup = Backbone.View.extend({
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .iframe': 'iframeButton_clickHandler',
      'submit form': 'form_submitHandler',
      'change .check-all': 'checkAll_changeHandler',
      'change input[type=range]': 'range_changeHandler',
      'change .shortcut': 'shortcut_changeHandler'
    },
    displayResult: function (isSuccess, msg) {
      this.$('.fa-spinner').remove();
      this.$el.removeClass('processing');
      this.$('.alert')
        .hide()
        .toggleClass('alert-error alert-danger', !isSuccess)
        .toggleClass('alert-success', isSuccess)
        .text(msg)
        .slideDown();
    },
    initUI: function (title, content, hasConfirm, hasCancel, isRemote) {
      this.$el
        .find('.modal-title, .modal-header h3').text(title).end()
        .find('.modal-footer .btn-primary')
          .prop('disabled', hasConfirm)
          .toggleClass('hide', !hasConfirm).end()
        .find('[type=button]').toggleClass('hide', !hasCancel).end()
        .modal('show');
      if (isRemote) {
        this.$('.modal-body')
          .html('<p align="center"><i class="icon-spin icon-spinner icon-4x fa fa-spinner fa-spin fa-4x"></i></p>')
          .load(content, _.bind(this.loadCompleteHandler, this));
      } else {
        this.$('.modal-body').html(content);
      }
    },
    checkAll_changeHandler: function (event) {
      var target = $(event.currentTarget),
          table = target.closest('table');
      table.find('input[type=checkbox]').prop('checked', target.prop('checked'));
    },
    deleteButton_clickHandler: function (event) {
      dianjoy.utils.deleteRow($(event.currentTarget));

      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    },
    form_submitHandler: function (event) {
      var submitButton = this.$('.modal-footer .btn-primary');
      if (submitButton.prop('disabled') || this.$el.hasClass('processing')) {
        return false;
      }
      this.$el.addClass('processing');
      submitButton
        .prop('disabled', true)
        .prepend('<i class="icon-spinner icon-spin fa fa-spinner fa-spin"></i> ');

      // ajax提交表单
      var form = event.currentTarget,
          url  = form.action,
          data = $(form).serialize();
      dianjoy.service.Manager.call(url, data, this.remote_successHandler, this.remote_errorHandler, this);
      return false;
    },
    iframeButton_clickHandler: function (event) {
      R.router.navigate('#/iframe/' + encodeURIComponent(event.currentTarget.getAttribute('href')));
      this.$el.modal('hide');
      event.preventDefault();
    },
    range_changeHandler: function (event) {
      $(event.currentTarget).siblings('.help-inline').text(event.currentTarget.value);
    },
    remote_successHandler: function (response) {
      this.displayResult(true, response.msg);

      if ('value' in response || 'classes' in response) {
        if (this.button && 'value' in response) {
          this.button.html(response.value);
          this.button.trigger('modified', response.value);
        }
        if (this.button && 'classes' in response) {
          this.button.toggleClass(response.classes);
        }
      }
      if (this.button) {
        switch(this.button.data('on-success')) {
          case 'remove-row':
            this.button.closest('tr').remove();
            break;
        }
      }
      this.model.set(_.omit(response, 'code', 'msg'));

      var modal = this.$el;
      setTimeout(function () {
        modal.modal('hide');
      }, 3000);
    },
    remote_errorHandler: function (xhr, status, error) {
      this.displayResult(false, xhr.hasOwnProperty('msg') ? xhr.msg : error);

      this.$('form').find('input, select, button').prop('disabled', false);
      this.$('.modal-footer .btn-primary').prop('disabled', false);
    },
    shortcut_changeHandler: function (event) {
      var target = event.currentTarget,
          value = target.value;
      try {
        value = JSON.parse(value);
        if (_.isObject(value)) {
          var form = target.form;
          for (var prop in value) {
            if (prop in form.elements) {
              form.elements[prop].value = value[prop];
            }
          }
        }
      } catch (e) {

      }
    },
    submitButton_clickHandler: function () {
      var form = this.$('form');
      if (form.length > 0) {
        if (dianjoy.form.checkForm(form[0])) {
          form.submit();
        }
      } else {
        this.$el.modal('hide');
      }
    },
    hiddenHandler: function () {
      this.$('.modal-body').empty();
      this.$('.hasDatepicker').datepicker('destroy');
      ns.Manager.trigger('normal:hidden', this);
    },
    loadCompleteHandler: function() {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.date').datepicker({
        dateFormat: 'yy-mm-dd'
      });
      ns.Manager.trigger('load');
    },
    showHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.alert').addClass('hide');
    }
  });

  var EditPopup = dianjoy.view.DataSyncView.extend({
    $context: null,
    form: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'keydown': 'keydownHandler',
      'click .btn-primary': 'submitButton_clickHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
    },
    initUI: function (options) {
      if (options) {
        this.$('form').html(this.template(options));
        this.$('select').val(options.value);
        $('[data-for=' + options.prop + ']').clone().show().appendTo(this.$('form'));
      } else {
        this.$('form').html('<p align="center"><i class="fa fa-spin fa-spinner fa-4x"></i></p>');
      }

      // 用组件适配用户操作
      if (this.form) {
        this.form.setElement(this.$('form'));
        this.form.setModel(this.model);
      } else {
        this.form = this.$context.createInstance(dianjoy.component.SmartForm, {
          el: this.$('form'),
          model: this.model
        });
      }
    },
    hide: function () {
      var modal = this.$el;
      setTimeout(function () {
        modal.modal('hide');
      }, 3000);
    },
    reset: function () {
      this.$('.btn-primary').prop('disabled', false)
        .find('i').removeClass('fa-spin fa-spinner');
    },
    save: function () {
      if ($(this.el.elements).filter('[type=submit], button').not('button[type]').prop('disabled')) {
        return;
      }
      this.trigger('submit');
    },
    value: function () {
      var radio = this.$('[name=prop-radio]');
      if (radio.length) {
        return this.$('[name=prop-' + radio.filter(':checked').val() + ']').val();
      }
      return this.$('[name=prop]').val();
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    submitButton_clickHandler: function (event) {
      this.save();
      event.preventDefault();
    },
    keydownHandler: function (event) {
      if (event.ctrlKey && event.keyCode === 13) { // ctrl+enter
        this.save();
        event.preventDefault();
      }
    },
    hiddenHandler: function () {
      this.trigger('hidden');
    },
    showHandler: function () {
      this.$('.btn-primary').prop('disabled', false);
      this.$('.alert-msg').hide();
    }
  });

  ns.Manager = _.extend({
    $context: null,
    popup: function (title, content, hasConfirm, hasCancel, isRemote) {
      hasConfirm = hasConfirm !== null ? hasConfirm : true;
      hasCancel = hasCancel !== null ? hasCancel : true;
      popup = popup || this.$context.createInstance(NormalAlertPopup, {
        el: '#normal-popup',
        model: ns.mediator
      });
      popup.initUI(title, content, hasConfirm, hasCancel, isRemote);
    },
    popupEditor: function (model, options) {
      editor = editor || this.$context.createInstance(EditPopup, {
        el: '#edit-popup',
        model: model
      });
      editor.model = model;
      editor.initUI(options);
      editor.$el.modal('show');
      return editor;
    }
  }, Backbone.Events);

  $(document).on('click', '.popup', function () {
    var target = $(this),
        data = target.data(),
        hasConfirm = 'confirm' in data ? data.confirm : true,
        hasCancel = 'cancel' in data ? data.cancel : true;
    popup = popup || new NormalAlertPopup({
      el: '#normal-popup',
      model: ns.mediator
    });
    popup.button = target;
    ns.Manager.popup(this.title || target.text(), this.href, hasConfirm, hasCancel, true);
    return false;
  });
}(Nervenet.createNameSpace('dianjoy.popup')));
