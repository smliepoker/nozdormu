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
      'submit form': 'form_submitHandler'
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
    submitButton_clickHandler: function (event) {
      if (!event.currentTarget.form) {
        this.$el.modal('hide');
      }
    },
    hiddenHandler: function () {
      dianjoy.component.Manager.clear(this.$el);
      this.$('.modal-body').empty();
      ns.Manager.trigger('normal:hidden', this);
    },
    loadCompleteHandler: function() {
      this.$('.modal-footer .btn-primary').prop('disabled', false);
      dianjoy.component.Manager.check(this.$el, this.model);
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
      'click .search-button': 'searchButton_clickHandler',
      'click .add-button': 'addButton_clickHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler'
    },
    initUI: function (options) {
      if (options) {
        this.options = options;
        $.get(webURL + 'template/popup-' + options.type + '.hbs', _.bind(this.loadCompleteHandler, this));
      }
      this.$('form').html('<p align="center"><i class="fa fa-spin fa-spinner fa-4x"></i></p>');
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
    add: function () {
      var value = this.$('[name=query]').val().replace(/^\s+|\s+$/, '');
      if (value && !this.collection.findWhere({tag: value})){
        this.$('[name=query], .add-button').prop('disabled', true);
        this.$('.add-button i').addClass('fa-spin fa-spinner');
        this.collection.create({tag: value}, {wait: true});
      }
    },
    save: function () {
      if ($(this.el.elements).filter('[type=submit], button').not('button[type]').prop('disabled')) {
        return;
      }
      this.trigger('submit', this.value());
    },
    search: function () {
      var keyword = this.$('[type=search]').val();
      if (!keyword) {
        return;
      }
      this.collection.fetch({keyword: keyword, from: 'editor'});
      this.$('[type=search], .search-button').prop('disabled', true);
    },
    value: function () {
      // 由radio确定从哪里取值
      var radio = this.$('[name=prop-radio]');
      if (radio.length) {
        return this.$('[name=prop-' + radio.filter(':checked').val() + ']').val();
      }
      // 正常取值
      var items = this.$('[name=prop], [name="prop[]"]');
      if (items.length === 1) {
        return items.val();
      }
      var value = [];
      items.filter(':checked').each(function () {
        value.push(this.value);
      });
      return value.join('|');
    },
    addButton_clickHandler: function () {
      this.add();
    },
    collection_addHandler: function (model) {
      this.$('.tags').append(this.item({value: [model.toJSON()]}));
      this.$('[name=query],.add-button').prop('disabled', false).val('');
      this.$('.add-button i').removeClass('fa-spin fa-spinner');
    },
    collection_resetHandler: function () {
      var html = this.item({list: this.collection.toJSON()});
      this.$('.search-result').html(html);
      this.$('[type=search], .search-button').prop('disabled', false);
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    searchButton_clickHandler: function () {
      this.search();
    },
    submitButton_clickHandler: function (event) {
      this.save();
      event.preventDefault();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        var target = event.target;
        if (target.type === 'search' && target.value != '') { // search
          this.search();
          event.preventDefault();
        }
        if (this.options.type === 'tags' && target.value != '') {
          this.add();
          event.preventDefault();
        }
        if (event.ctrlKey) { // ctrl+enter
          this.save();
          event.preventDefault();
        }
      }
    },
    loadCompleteHandler: function (data) {
      this.template = Handlebars.compile(data);
      this.$('form').html(this.template(this.options));
      this.$('select').val(this.options.value);
      $('[data-for=' + this.options.prop + ']').clone().show().appendTo(this.$('form'));

      var html = this.$('.item-grid').html();
      if (html) {
        html = html.replace(/\${([#@\-\w\s\/]+)}/g, '{{$1}}');
        this.item = Handlebars.compile(html);
        this.$('.item-grid').empty();
      }

      if (this.options.type === 'search') {
        this.collection.on('reset', this.collection_resetHandler, this);
      }
      if (this.options.type === 'tags') {
        this.collection.on('add', this.collection_addHandler, this);
        this.$('.item-grid').html(this.item({value: this.collection.toJSON()}));
      }

      // 用组件适配用户操作
      this.$('[type=datetime]').datetimepicker();
      dianjoy.component.Manager.check(this.$el, this.model);
    },
    hiddenHandler: function () {
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
      ns.Manager.popup(this.title || target.text(), this.href, hasConfirm, hasCancel, true);
      ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
      event.preventDefault();
    })
    .on('show.bs.modal', '#normal-popup', function () {
      popup = popup || ns.Manager.$context.createInstance(NormalAlertPopup, {
        el: this,
        model: ns.mediator
      });
    });
}(Nervenet.createNameSpace('dianjoy.popup')));
