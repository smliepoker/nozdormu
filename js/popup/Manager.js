/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
;(function (ns) {
  'use strict';
  var popup
    , editor
    , timeout;

  var NormalAlertPopup = dianjoy.view.DataSyncView.extend({
    $context: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'loaded.bs.modal': 'loadCompleteHandler',
      'click .modal-footer .btn-primary': 'submitButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'submit form': 'form_submitHandler',
      'change .check-all': 'checkAll_changeHandler'
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
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
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
      var context = this.$context;
      this.$('form').each(function () {
        this.action = baseURL + $(this).attr('action');
        context.createInstance(dianjoy.component.SmartForm, {
          el: this,
          model: ns.mediator
        });
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
      'hide.bs.modal': 'hideHandler',
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

        if (options.search) {
          var html = this.$('.search-result').html();
          html = html.replace(/\${([#@\-\w\s\/]+)}/g, '{{$1}}');
          this.item = Handlebars.compile(html);
          this.$('.search-result').empty();
          this.collection.on('reset', this.collection_resetHandler, this);
        }
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
      timeout = setTimeout(function () {
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
      this.trigger('submit', this.value());
    },
    value: function () {
      var radio = this.$('[name=prop-radio]');
      if (radio.length) {
        return this.$('[name=prop-' + radio.filter(':checked').val() + ']').val();
      }
      return this.$('[name=prop]').val();
    },
    collection_resetHandler: function () {
      var html = this.item({list: this.collection.toJSON()});
      this.$('.search-result').html(html);
      this.$('[type=search]').prop('disabled', false);
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    submitButton_clickHandler: function (event) {
      this.save();
      event.preventDefault();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        var target = event.target;
        if (target.type === 'search' && target.value != '') { // search
          this.collection.fetch({keyword: target.value, from: 'editor'});
          $(target).prop('disabled', true);
          event.preventDefault();
        }
        if (event.ctrlKey) { // ctrl+enter
          this.save();
          event.preventDefault();
        }
      }
    },
    hideHandler: function () {
      this.trigger('hidden');
      clearTimeout(timeout);
    },
    showHandler: function () {
      this.$('.btn-primary').prop('disabled', false);
      this.$('.alert-msg').hide();
    }
  });

  ns.Manager = _.extend({
    $context: null,
    postConstruct: function () {
      if (popup) {
        this.$context.inject(popup);
      }
    },
    popup: function (title, content, hasConfirm, hasCancel, isRemote) {
      hasConfirm = hasConfirm !== null ? hasConfirm : true;
      hasCancel = hasCancel !== null ? hasCancel : true;
      popup = popup || this.$context.createInstance(NormalAlertPopup, {
        el: '#normal-popup',
        model: ns.mediator
      });
      popup.initUI(title, content, hasConfirm, hasCancel, isRemote);
    },
    popupEditor: function (model, options, collection) {
      if (editor) {
        if (editor.collection) {
          editor.collection.off(null, null, editor);
        }
        editor.model = model;
        editor.collection = collection;
      } else {
        editor = this.$context.createInstance(EditPopup, {
          el: '#edit-popup',
          model: model,
          collection: collection
        });
      }
      editor.initUI(options);
      editor.$el.modal('show');
      return editor;
    }
  }, Backbone.Events);

  $(document)
    .on('click', '.popup', function (event) {
      var target = $(this),
          data = target.data(),
          hasConfirm = 'confirm' in data ? data.confirm : true,
          hasCancel = 'cancel' in data ? data.cancel : true;
      popup = popup || ns.Manager.$context.createInstance(NormalAlertPopup, {
        el: '#normal-popup',
        model: ns.mediator
      });
      popup.button = target;
      ns.Manager.popup(this.title || target.text(), this.href, hasConfirm, hasCancel, true);
      ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
      event.preventDefault();
      return false;
    })
    .on('show.bs.modal', '#normal-popup', function () {
      popup = popup || ns.Manager.$context.createInstance(NormalAlertPopup, {
        el: this,
        model: ns.mediator
      });
    });
}(Nervenet.createNameSpace('dianjoy.popup')));
