;(function (ns) {
  'use strict';
  ns.AdminPanel = Backbone.Router.extend({
    $mainPage: null,
    $subPage: null,
    lastPage: '',
    routes: {
      '': 'showHomepage',
      'admin/:sub': 'showAdminPage',
      ':cate/:sub(/:id)(/*path)': 'showNormalPage'
    },
    execute: function (callback, args) {
      if (location.hash === this.lastPage) {
        return;
      }
      if (this.$subPage.preCheck()) {
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
    },
    showAdminPage: function (sub) {
      var url = baseURL + '/admin/' + sub + '.php';
      this.$subPage.load(url);
    }
  });
})(Nervenet.createNameSpace('dianjoy.router'));
