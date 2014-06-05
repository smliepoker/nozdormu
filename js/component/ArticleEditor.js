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
    $router: null,
    preview: null,
    lastAutoSave: 0,
    events: {
      'textInput textarea': 'textArea_textInputHandler',
      'change [name="topic"]': 'topic_changeHandler',
      'click .publish-button': 'publishButton_clickHandler',
      'click .save-button': 'saveButton_clickHandler',
      'click .status-button': 'statusButton_clickHandler',
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
                  name: "上传图片",
                  title: "上传图片",
                  icon: "fa fa-cloud-upload",
                  callback: function (editor) {
                    var options = {
                      prop: 'attachment',
                      type: 'img'
                    };
                    var popup = dianjoy.popup.Manager.popupEditor(self.model, options);
                    popup.once('submit', function (value) {
                      var selected = editor.getSelection()
                        , label = selected.text || '图片描述'
                        , chunk = '![' + label + '](' + value + ')'
                        , start = selected.start;
                      editor.replaceSelection(chunk);
                      editor.setSelection(start, start + chunk.length);
                      popup.hide(0);
                      self.refreshPreview();
                    });
                  }
                },
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
                    dianjoy.popup.Manager.popup('帮助', webURL + 'page/editor-help.html', false, true, true);
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
      this.template = $(data.template);
      this.template = this.template.length ? Handlebars.compile(this.template.remove().html()) : null;

      // model.id存在表示编辑，不然就是新建了
      this.model.urlRoot = this.el.action;
      if (this.model.id) {
        this.model.once('sync', this.render, this);
        this.model.fetch();
      } else {
        this.render();
        this.model.once('change:id', this.model_savedOnServerHandler, this);
      }
    },
    remove: function () {
      clearInterval(interval);
      this.model.off(null, null, this);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('[name=topic]').val(this.model.get('topic'));
      this.$('textarea').val(this.model.get('content'));
      // 生成预览内容
      this.refreshPreview();
      // 上次自动保存的内容
      var store = localStorage.getItem(KEY);
      store = store ? JSON.parse(store) : null;
      if (store && (store.id === this.model.id || store.id === 0 && !this.model.id)) {
        this.lastAutoSave = store.time;
        this.refreshAutoSaveTime(store.time)
      } else {
        this.$('.auto-save-info').text('（空）');
      }
      // 修改发布按钮的状态
      var active = this.model.get('status') === this.$('.publish-button').data('active');
      this.$('.publish-button').toggleClass('active', active)
        .find('i').toggleClass('fa-check-square-o', active)
        .toggleClass('fa-square-o', !active);
      var model = this.model;
      this.$('.status-button').toggleClass(function () {
        return model.get($(this).attr('href').substr(1)) ? 'active' : '';
      });
    },
    autoSave: function () {
      this.lastAutoSave = Date.now();
      localStorage.setItem(KEY, JSON.stringify({
        id: this.model.id || 0,
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
      if ('id' in this.model.changed) {
        return true;
      }
      var isModified = this.model.get('content') !== this.$('textarea').val() || this.model.get('topic') !== this.$('[name=topic]').val();
      return !isModified || confirm('您修改的内容尚未保存，确定要离开么？');
    },
    refreshAutoSaveTime: function (time) {
      time = time || this.lastAutoSave;
      this.$('.auto-save-info').text('上次自动保存：' + moment(time).fromNow());

      // 定时更新自动保存的时间
      if (interval === 0) {
        interval = setInterval(_.bind(this.refreshAutoSaveTime, this), 60000);
      }
    },
    refreshPreview: function () {
      var content = marked(this.$('textarea').val());
      if (!this.template) {
        return this.preview.html(content);
      }
      this.preview.html(this.template(_.extend(this.model.toJSON(), {
        topic: this.$('[name=topic]').val(),
        content: content
      })));
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
    model_savedOnServerHandler: function (model, id) {
      this.$router.navigate(location.hash + '/' + id, {trigger: false, replace: true});
    },
    model_saveErrorHandler: function (error) {
      console.log(error);
      this.displayResult(false, '保存失败，请稍后重试', 'fa-frown-o');
    },
    model_saveSuccessHandler: function () {
      this.displayResult(true, '保存成功', 'fa-smile-o');
    },
    publishButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , data = target.data();
      this.model.save('status', target.hasClass('active') ? data.deactive : data.active, {patch: true});
      target.toggleClass('active')
        .find('i').toggleClass('fa-square-o fa-check-square-o');
    },
    saveButton_clickHandler: function () {
      this.save();
    },
    statusButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , prop = event.currentTarget.hash.substr(1)
        , data = _.extend({active: 1, deactive: 0}, target.data())
        , value = target.hasClass('active') ? data.deactive : data.active;
      this.model.save(prop, value, {patch: true});
      target.toggleClass('active');
      event.preventDefault();
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