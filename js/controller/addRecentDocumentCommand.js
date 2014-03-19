/**
 * Created by meathill on 14-3-18.
 */
;(function (ns) {
  var KEY = 'recent-docs'
  ns.addRecentDocumentCommand = function (title) {
    var hash = location.hash
      , store = localStorage.getItem(KEY);
    store = store ? JSON.parse(store) : [];
    _.remove(store, function (item) {
      return item.url = hash;
    })
    store.push({
      title: title,
      url: hash
    });
    if (store.length > 10) {
      store.shift();
    }
    localStorage.setItem(KEY, JSON.stringify(store));
  }
}(Nervenet.createNameSpace('dianjoy.controller')));