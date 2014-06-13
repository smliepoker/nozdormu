;(function (ns) {
  'use strict';

  var pageReg = /\/p(\d+)(\/?)/;

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
        Backbone.Router.prototype.execute.call(this, callback, args);
      } else {
        this.navigate(this.lastPage, {trigger: false, replace: true});
      }
    },
    pageTo: function (page) {
      var pn = location.hash.match(pageReg)
        , options = {
          trigger: false,
          replace: true
        };
      if (pn) {
        this.navigate(location.hash.replace(pageReg, '/p' + page + '$2'), options);
      } else {
        this.navigate(location.hash + '/p' + page, options);
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
