;(function (ns) {
  'use strict';

  ns.BaseRouter = Backbone.Router.extend({
    $mainPage: null,
    $subPage: null,
    $mediator: null,
    lastPage: null,
    params: {}, // 用于存储解析当前路径得到的参数
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
    /**
     * 判断当前路径的参数和上一次记录的是否不一致
     * @param data
     * @param omit
     */
    diff: function (data, omit) {
      omit = omit || ['p', 'keyword', 'path']; // 忽略的参数，默认包括翻页和搜索
      var keys = _.chain(data).omit(omit).keys().value();
      for (var i = 0, len = keys.length; i < len; i++) {
        if (data[keys[i]] !== this.params[keys[i]]) {
          return true;
        }
      }
      // 需要更新到页面中
      var pick = _.extend({page: 0}, _.pick(data, 'p', 'keyword'));
      if (pick.p) {
        pick.page = pick.p;
      }
      this.$mediator.set(pick);
      return false;
    },
    getPath: function () {
      var path = '#/' + this.params.cate + '/' + this.params.sub + '/'
        , rest = [];
      for (var prop in this.params) {
        if (!this.params[prop] || prop === 'path') {
          continue;
        }
        var label;
        if (prop === 'page') {
          label = 'p';
        } else if (prop === 'keyword') {
          label = 'keyword-';
        } else if (prop === 'id') {
          label = '';
        } else {
          label = prop;
        }
        if (prop !== 'cate' && prop !== 'sub') {
          rest.push(label + this.params[prop]);
        }
      }
      if (rest.length) {
        path += rest.join('/');
      }
      return path;
    },
    postConstruct: function () {
      this.$mediator.on('change', this.mediator_changeHandler, this);
    },
    showHomepage: function () {
      var url = baseURL + 'dashboard/';
      this.$subPage.load(url);
    },
    /**
     * 打开页面通用函数，这里仅是范例，用户应判断当前路径包含的参数，若一致就不用那个跳转了
     * @param cate
     * @param sub
     * @param id
     * @param path
     */
    showNormalPage: function (cate, sub, id, path) {
      var data = {
        cate: cate,
        sub: sub,
        id: id,
        path: path
      };
      if (this.diff(data)) {
        return;
      }
      this.params = data;
      var url = baseURL + cate + '/template/' + sub + '.html';
      this.$subPage.load(url, data);
    },
    mediator_changeHandler: function (model) {
      var changed = _.pick(model.changed, 'page', 'keyword');
      if (_.keys(changed).length > 0) {
        this.params = _.extend(this.params, changed);
        this.navigate(this.getPath(), {trigger: false});
      }
    }
  });
})(Nervenet.createNameSpace('dianjoy.router'));
