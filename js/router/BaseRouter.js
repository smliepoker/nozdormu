;(function (ns) {
  'use strict';
  ns.BaseRouter = Backbone.Router.extend({
    $mainPage: null,
    $subPage: null,
    lastPage: null,
    routes: {
      '': 'showHomepage',
      ':cate/:sub(/:id)(/*path)': 'showNormalPage'
    },
    execute: function (callback, args) {
      if (location.hash === this.lastPage) {
        return;
      }
      if (dianjoy.component.Manager.preCheck(this.$subPage.$el)) {
        this.lastPage = location.hash;
        callback.apply(this, args);
      } else {
        this.navigate(this.lastPage, {trigger: false, replace: true});
      }
    },
    showHomepage: function () {
      var url = baseURL + 'dashboard/';
      this.$subPage.load(url);
    },
    showNormalPage: function (cate, sub, id, path) {
      var url = baseURL + cate + '/template/' + sub + '.html';
      this.$subPage.load(url, id, path);
    }
  });
})(Nervenet.createNameSpace('dianjoy.router'));
