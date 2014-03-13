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
      if (path) {
        var paths = path.split('/')
          , params = {};
        for (var i = 0, len = paths.length; i < len; i++) {
          var kv = paths[i].split(':');
          params[kv[0]] = kv[1];
        }
      }
      this.$subPage.load(url, params);
      this.$mainPage.setBreadcrumb();
    },
    showAdminPage: function (sub) {
      var url = baseURL + '/admin/' + sub + '.php';
      this.$subPage.load(url);
      this.$mainPage.setBreadcrumb();
    }
  });
})(Nervenet.createNameSpace('dianjoy.router'));
