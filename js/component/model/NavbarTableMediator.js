;(function (ns) {
  'use strict';
  function getPageName() {
    var hash = location.hash;
    if (hash) {
      return hash.split('/')[1];
    }
    var pathname = location.pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1, pathname.lastIndexOf('.'));
  }
  var init = {
    defaults: {
      'highlight': -1,
      'show': '',
      'owner': -1,
      'adlabel': '-',
      'chlabel': '-'
    },
    fetch: function () {
      var item = localStorage.getItem(getPageName());
      if (item) {
        item = JSON.parse(item);
        this.set(item, {silent: true});
        this.trigger('translate', item.chlabel, item.adlabel, item.ownerlabel);
      }
    },
    save: function () {
      if (window.R) {
        localStorage.setItem(getPageName(), JSON.stringify(this.getLabels()));
      }
    },
    getFilters: function () {
      return _.pick(this.attributes, 'ad', 'ch', 'owner', 'pub', 'country', 'jt', 'tt');
    },
    getLabels: function () {
      return _.pick(this.attributes, 'adlabel', 'chlabel', 'ownerlabel');
    }
  };
  ns.NavbarTableMediator = Backbone.Model.extend(init);
}(Nervenet.createNameSpace('Dianjoy.component.model')));
