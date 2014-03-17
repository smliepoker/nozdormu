;(function (ns) {
  'use strict';
  ns.AdminPanel = Backbone.Router.extend({
    $mainPage: null,
    $subPage: null,
    routes: {
      '': 'showHomepage',
      'admin/:sub': 'showAdminPage',
      ':cate/:sub(/*path)': 'showNormalPage'
    },
    showHomepage: function () {
      var url = baseURL + 'dashboard/';
      this.$subPage.load(url);
      this.$mainPage.setBreadcrumb();
    },
    showNormalPage: function (cate, sub, path) {
      var url = baseURL + cate + '/template/' + sub + '.html';
      this.$subPage.load(url, path);
      this.$mainPage.setBreadcrumb();
    },
    showAdminPage: function (sub) {
      var url = baseURL + '/admin/' + sub + '.php';
      this.$subPage.load(url);
      this.$mainPage.setBreadcrumb();
    }
  });
})(Nervenet.createNameSpace('dianjoy.router'));
