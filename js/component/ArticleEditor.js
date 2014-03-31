/**
 * Created by meathill on 14-3-17.
 */
;(function (ns) {
  'use strict';
  var KEY = 'editor-auto-save'
    , timeout = 0
    , interval = 0;
  ns.ArticleEditor = dianjoy.view.DataSyncView.extend({
    $context: null,
    preview: null,
    lastAutoSave: 0,
    events: {
      'textInput textarea': 'textArea_textInputHandler',
      'change [name="topic"]': 'topic_changeHandler',
      'click .save-button': 'saveButton_clickHandler',
      'keydown': 'keydownHandler'
    },
    initialize: function () {
      var self = this
        , data = this.$el.data();
      this.$('textarea').markdown({
        iconlibrary: 'fa',
        additionalButtons: [
          [
            {
              name: "file",
              data: [
                {
                  name: "读取本地存储",
                  title: "读取本地存储",
                  icon: "fa fa-upload",
                  callback: function () {
                    self.loadAutoSave();
                  }
                }
              ]
            },
            {
              name: "help",
              data: [
                {
                  name: "帮助",
                  title: "帮助",
                  icon: "fa fa-question",
                  callback: function () {
                    dianjoy.popup.Manager.popup('帮助', webURL + 'template/editor-help.html', false, true, true);
                  }
                }
              ]
            }
          ]
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
    remove: function () {
      clearInterval(interval);
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
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
        this.lastAutoSave = store.time;
        this.refreshAutoSaveTime(store.time)
      } else {
        this.$('.auto-save-info').text('（空）');
      }
    },
    autoSave: function () {
      this.lastAutoSave = Date.now();
      localStorage.setItem(KEY, JSON.stringify({
        id: this.model.id,
        title: this.$('[name=topic]').val(),
        content: this.$('textarea').val(),
        time: this.lastAutoSave
      }));
    },
    countDown: function () {
      clearTimeout(timeout);
      timeout = setTimeout(_.bind(this.countDownHandler, this), 1000);
    },
    loadAutoSave: function () {
      var store = localStorage.getItem(KEY);
      store = store ? JSON.parse(store) : null;
      if (store && store.id === this.model.id) {
        this.$('textarea').val(store.content);
      } else {
        alert('暂无保存在本地的内容。');
      }
    },
    preCheck: function () {
      var isModified = this.model.get('content') !== this.$('textarea').val() || this.model.get('topic') !== this.$('[name=topic]').val();
      return !isModified || confirm('您修改的内容尚未保存，确定要离开么？');
    },
    refreshAutoSaveTime: function (time) {
      time = time || this.lastAutoSave;
      this.$('.auto-save-info').text('上次自动保存：' + moment(time).fromNow());

      // 定时更新自动保存的时间
      if (interval === 0) {
        interval = setInterval(_.bind(this.refreshAutoSaveTime, this), 1000);
      }
    },
    refreshPreview: function () {
      var content = this.$('textarea').val();
      this.preview.html(marked(content));
    },
    save: function() {
      this.model.save({
        topic: this.$('[name=topic]').val(),
        content: this.$('textarea').val()
      }, {
        patch: true,
        wait: true,
        success: _.bind(this.model_saveSuccessHandler, this),
        error: _.bind(this.model_saveErrorHandler, this)
      });
      this.displayProcessing();
    },
    model_saveErrorHandler: function (error) {
      console.log(error);
      this.displayResult(false, '保存失败，请稍后重试', 'fa-frown-o');
    },
    model_saveSuccessHandler: function (response) {
      this.displayResult(true, '保存成功', 'fa-smile-o');
    },
    saveButton_clickHandler: function () {
      this.save();
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
        this.save();
        event.preventDefault();
      }
      if (event.keyCode === 8 || event.keyCode === 46) {
        this.countDown();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));