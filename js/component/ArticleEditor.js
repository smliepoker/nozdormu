/**
 * Created by meathill on 14-3-17.
 */
;(function (ns) {
  'use strict';
  var KEY = 'editor-auto-save'
    , timeout = 0
    , isConverting = false;
  ns.ArticleEditor = Backbone.View.extend({
    $context: null,
    preview: null,
    events: {
      'textInput textarea': 'textArea_textInputHandler',
      'change [name="topic"]': 'topic_changeHandler',
      'keydown': 'keydownHandler'
    },
    initialize: function () {
      var data = this.$el.data();
      this.$('textarea').markdown({
        iconlibrary: 'fa',
        additionalButtons: [
          [{
            name: "groupCustom",
            data: [
              {
                name: "帮助",
                title: "帮助",
                icon: "fa fa-question",
                callback: function () {
                  dianjoy.popup.Manager.popup('帮助', webURL + 'template/editor-help.html', false, true, true);
                }
              },
              {
                name: "打开自动存储",
                title: "打开自动存储",
                icon: "fa fa-upload",
                callback: function () {

                }
              }
            ]
          }]
        ]
      });
      this.preview = $(data.preview);
      if (this.preview.length === 0) {
        this.undelegateEvents();
      }

      this.model.urlRoot = this.el.action;
      this.model.on('sync', this.render, this);
      this.model.fetch();
    },
    render: function (model) {
      this.$('[name=topic]').val(model.get('topic'))
      this.$('textarea').val(model.get('content'));
      // 生成预览内容
      this.refreshPreview();
      // 上次自动保存的内容
      var store = localStorage.getItem(KEY);
      store = store ? JSON.parse(store) : null;
      if (store && store.id === this.model.id) {
        this.$('.auto-save-info').text('上次自动保存：' + moment(store.time).fromNow());
      }
    },
    autoSave: function () {
      var now = Date.now();
      localStorage.setItem(KEY, JSON.stringify({
        id: this.model.id,
        title: this.$('[name=topic]').val(),
        content: this.$('textarea').val(),
        time: now
      }));
      this.$('.auto-save-info').text('自动保存：' + moment(now).fromNow());
    },
    countDown: function () {
      clearTimeout(timeout);
      timeout = setTimeout(_.bind(this.countDownHandler, this), 1000);
    },
    refreshPreview: function () {
      var content = this.$('textarea').val();
      this.preview.html(marked(content));
    },
    textArea_textInputHandler: function () {
      this.countDown();
    },
    topic_changeHandler: function (event) {
      // 增加最近编辑的文档
      this.$context.trigger('add-document', event.currentTarget.value);
    },
    countDownHandler: function () {
      this.refreshPreview();
      this.autoSave();
    },
    keydownHandler: function (event) {
      if (event.ctrlKey && event.keyCode === 13) { // ctrl+enter
        this.$el.submit();
      }
      if (event.keyCode === 8 || event.keyCode === 46) {
        this.countDown();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));