/**
 * Created by meathill on 14-3-17.
 */
;(function (ns) {
  var timeout = 0
    , isConverting = false;
  ns.ArticleEditor = Backbone.View.extend({
    preview: null,
    events: {
      'textinput textarea': 'textArea_textInputHandler',
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
    textArea_textInputHandler: function (event) {
      clearTimeout(timeout);
      var preview = this.preview
        , content = event.currentTarget.value;
      timeout = setTimeout(function () {
        isConverting = true;
        preview.html(marked(content));
      }, 1000);
    },
    keydownHandler: function (event) {
      if (event.ctrlKey && event.keyCode === 13) { // ctrl+enter
        this.$el.submit();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));