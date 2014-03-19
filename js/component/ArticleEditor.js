/**
 * Created by meathill on 14-3-17.
 */
;(function (ns) {
  var timeout = 0
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
            data: [{
              name: "帮助",
              title: "帮助",
              icon: "fa fa-question",
              callback: function () {
                dianjoy.popup.Manager.popup('帮助', webURL + 'template/editor-help.html', false, true, true);
              }
            }]
          }]
        ]
      });
      this.preview = $(data.preview);
      if (this.preview.length === 0) {
        this.undelegateEvents();
      }
    },
    refreshPreview: function () {
      clearTimeout(timeout);
      var preview = this.preview
        , content = event.currentTarget.value;
      timeout = setTimeout(function () {
        isConverting = true;
        preview.html(marked(content));
      }, 1000);
    },
    textArea_textInputHandler: function () {
      this.refreshPreview();
    },
    topic_changeHandler: function (event) {
      // 增加最近编辑的文档
      this.$context.trigger('add-document', event.currentTarget.value);
    },
    keydownHandler: function (event) {
      if (event.ctrlKey && event.keyCode === 13) { // ctrl+enter
        this.$el.submit();
      }
      if (event.keyCode === 8 || event.keyCode === 46) {
        this.refreshPreview();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));