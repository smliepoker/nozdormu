/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
;(function (ns) {
  'use strict';
  var popup;

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
      Dianjoy.utils.deleteRow($(event.currentTarget));

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
      Dianjoy.service.Manager.call(url, data, this.remote_successHandler, this.remote_errorHandler, this);
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
        if (Dianjoy.form.checkForm(form[0])) {
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

  ns.Manager = _.extend({
    popup: function (title, content, hasConfirm, hasCancel, isRemote) {
      hasConfirm = hasConfirm !== null ? hasConfirm : true;
      hasCancel = hasCancel !== null ? hasCancel : true;
      popup = popup || new NormalAlertPopup({
        el: '#normal-alert',
        model: ns.mediator
      });
      popup.initUI(title, content, hasConfirm, hasCancel, isRemote);
    }
  }, Backbone.Events);

  $(document).on('click', '.popup', function () {
    var target = $(this),
        data = target.data(),
        hasConfirm = 'confirm' in data ? data.confirm : true,
        hasCancel = 'cancel' in data ? data.cancel : true;
    popup = popup || new NormalAlertPopup({
      el: '#normal-alert',
      model: ns.mediator
    });
    popup.button = target;
    ns.Manager.popup(this.title || target.text(), this.href, hasConfirm, hasCancel, true);
    return false;
  });
}(Nervenet.createNameSpace('Dianjoy.popup')));

