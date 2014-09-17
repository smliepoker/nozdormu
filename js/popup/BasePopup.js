/**
 * Created by meathill on 14-9-17.
 */
;(function (ns) {
  'use strict';
  ns.BasePopup = dianjoy.view.DataSyncView.extend({
    $context: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'submit form': 'form_submitHandler'
    },
    initUI: function (title, content, hasConfirm, hasCancel, isRemote) {
      this.$el
        .find('.modal-title').text(title).end()
        .find('.modal-footer .btn-primary')
          .prop('disabled', true)
          .toggleClass('hide', !hasConfirm).end()
        .find('[type=button]')
          .toggleClass('hide', !hasCancel).end()
        .modal('show');
      if (isRemote) {
        if (/\.hbs$/i.test(content)) {
          $.ajax(content, {
            dataType: 'html',
            context: this,
            success: this.template_successHandler
          });
        } else {
          this.$('.modal-body').load(content, _.bind(this.loadCompleteHandler, this));
        }
        this.$('.modal-body').html('<p align="center"><i class="fa fa-spinner fa-spin fa-4x"></i></p>')
      } else {
        this.$('.modal-body').html(content);
      }
    },
    onLoadComplete: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      dianjoy.component.Manager.check(this.$el, this.model);
      ns.Manager.trigger('load');
    },
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
    },
    template_successHandler: function (response) {
      this.template = Handlebars.compile(response);
      this.$('.modal-body').html(this.template(config));
      this.onLoadComplete();
    },
    hiddenHandler: function () {
      dianjoy.component.Manager.clear(this.$el);
      this.$('.modal-body').empty();
      ns.Manager.trigger('normal:hidden', this);
    },
    loadCompleteHandler: function(response) {
      this.onLoadComplete();
    },
    showHandler: function () {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      this.$('.alert').addClass('hide');
    }
  });
}(Nervenet.createNameSpace('dianjoy.popup')));