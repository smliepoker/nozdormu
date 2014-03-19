/**
 * Created by meathill on 13-12-16.
 */
;(function (ns) {
  "use strict";
  ns.PageMediator = Backbone.Model.extend({
    // defaults里的字段主要用来筛选table的内容和翻页
    defaults: {
      'show': '',
      'keyword': '',
      'author': '',
      'page': 0
    },
    initialize: function () {
      this.on('change', this.changeHandler, this);
    },
    load: function () {
      var item = localStorage.getItem(this.cid);
      if (item) {
        item = JSON.parse(item);
        this.set(item);
      }
    },
    save: function () {
      localStorage.setItem(this.cid, JSON.stringify(this.getFilters()));
    },
    getFilters: function () {
      return _.pick(this.attributes, _.keys(this.defaults));
    },
    changeHandler: function () {
      this.save();
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));