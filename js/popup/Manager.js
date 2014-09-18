/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
;(function (ns) {
  'use strict';
  var popup
    , editor;

  ns.Manager = _.extend({
    $context: null,
    postConstruct: function () {
      if (popup) {
        this.$context.inject(popup);
      }
    },
    popup: function (options) {
      options.hasConfirm = 'hasConfirm' in options ? options.hasConfirm : true;
      options.hasCancel = 'hasCancel' in options ? options.hasCancel : true;
      popup = popup || this.$context.createInstance(ns.BasePopup, {
        el: '#normal-popup',
        model: ns.mediator
      });
      popup.render(options);
    },
    popupEditor: function (model, options, collection) {
      if (editor) {
        if (editor.collection) {
          editor.collection.off(null, null, editor);
        }
        editor.model = model;
        editor.collection = collection;
      } else {
        editor = this.$context.createInstance(ns.Editor, {
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
      ns.Manager.popup({
        title: this.title || target.text(),
        content: this.href,
        hasConfirm: hasConfirm,
        hasCancel: hasCancel,
        isRemote: true
      });
      ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
      event.preventDefault();
    })
    .on('show.bs.modal', '#normal-popup', function () {
      popup = popup || ns.Manager.$context.createInstance(ns.BasePopup, {
        el: this,
        model: ns.mediator
      });
    });
}(Nervenet.createNameSpace('dianjoy.popup')));
