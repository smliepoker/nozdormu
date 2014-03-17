/**
 * Created by meathill on 14-3-17.
 */
;(function (ns) {
  ns.ArticleEditor = Backbone.View.extend({
    initialize: function () {
      this.$('textarea').markdown({
        iconlibrary: 'fa'
      });
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));