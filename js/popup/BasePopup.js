/**
 * Created by meathill on 14-9-17.
 */
;(function (ns) {
  'use strict';

  var timeout;

  ns.BasePopup = dianjoy.view.DataSyncView.extend({
    $context: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'form-success': 'form_successHandler'
    },
    render: function (options) {
      this.options = options;
      if (options.isRemote) {
        this.$('.modal-body').html('<p align="center"><i class="fa fa-spinner fa-spin fa-4x"></i></p>');
        if (/\.hbs$/i.test(options.content)) {
          $.ajax(options.content, {
            dataType: 'html',
            context: this,
            success: this.template_successHandler
          });
          options.isRemote = false;
        } else {
          options.isRemote = options.content;
        }
      } else {
        this.$('.modal-body').html(options.content);
      }
      this.$el
        .find('.modal-title').text(options.title).end()
        .find('.modal-footer .btn-primary')
          .prop('disabled', true)
          .toggleClass('hide', !options.hasConfirm).end()
        .find('[type=button]')
          .toggleClass('hide', !options.hasCancel).end()
        .modal({
          show: true,
          remote: options.remote
        });
    },
    hide: function () {
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, 3000);
    },
    onLoadComplete: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      dianjoy.component.Manager.check(this.$el, this.model);
    },
    form_successHandler: function () {
      this.hide();
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
    },
    template_successHandler: function (response) {
      this.template = Handlebars.compile(response);
      this.$('.modal-body').html(this.template(this.options.data));
      this.onLoadComplete();
    },
    hiddenHandler: function () {
      dianjoy.component.Manager.clear(this.$el);
      this.$('.modal-body').empty();
      clearTimeout(timeout);
    },
    loadCompleteHandler: function() {
      this.onLoadComplete();
    },
    showHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.alert').hide();
    }
  });
}(Nervenet.createNameSpace('dianjoy.popup')));