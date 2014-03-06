;(function (ns) {
  'use strict';
  ns.AdminPanel = Backbone.Router.extend({
    routes: {
      'home': 'showHomepage',
      'home/:start/:end': 'showHomepage',
      'ad/:op': 'showAdPages',
      'ad/:op/:start': 'showAdPages',
      'ad/:op/:start/:end': 'showAdPages',
      'ad/:op/:start/:end/:id': 'showAdPages',
      'apk/:op': 'showApkPages',
      'apk/:op/:id(/)': 'showApkPages',
      'apk/:op/:id/:offer_id': 'showApkPages',
      'apk/apk/:key/:query': 'showApkByPage',
      'apk/apk/:key/:query/:page': 'showApkByPage',
      'apk/apk/:key/:query/:page/:order': 'showApkByPage',
      'apk/apk/:key/:query/:page/:order/:task': 'showApkByPage',
      'apk/apk/:key/:query/:page/:order/:task/:oversea': 'showApkByPage',
      'client/:op': 'showClientPages',
      'user/:op': 'showUserPages',
      'user/:op/:param': 'showUserPages',
      'user/:op/:param/:end': 'showUserPages',
      'stat/:op': 'showStatPages',
      'stat/:op/:start': 'showStatPages',
      'stat/:op/:start/:end(/)': 'showStatPages',
      'stat/:op/:start/:end/:id': 'showStatPages',
      'stat/:op/:start/:end/:id/:other': 'showStatPages',
      'system/:op': 'showSystemPage',
      'system/:op/:start': 'showSystemPage',
      'system/:op/:start/:end': 'showSystemPage',
      'system/:op/:start/:end/:id': 'showSystemPage',
      'channel/:op': 'showChannelPage',
      'publisher/:op': 'showPublisherPage',
      'publisher/:op/:status': 'showPublisherPage',
      'iframe/:url': 'showIframe',
      'popup/:title/:url': 'showPopup',
      'my/:op': 'showPagesAboutMe'
    },
    showAdPages: function (op, start, end, id) {
      start = start || '';
      end = end || '';
      id = id || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./ad/' + op.replace(/\?.*$/, '') + '.php?start=' + start + '&end=' + end + '&id=' + id);
    },
    showApkPages: function (op, id,offer_id) {
      id = id || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./apk/' + op + '.php?id=' + id+ '&offer_id=' + offer_id );
    },
    showApkByPage: function (key, query, page, order, task, oversea) {
      key = key || '';
      query = query || '';
      page = page || '';
      order = order || '';
      task = task || '';
      oversea = oversea || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./apk/apk.php?key=' + key + '&query=' + query + '&page=' + page + '&order=' + order + '&task=' + task + '&oversea=' + oversea);
    },
    showChannelPage: function (op) {
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./channel/' + op + '.php');
    },
    showClientPages: function (op) {
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./client/' + op + '.php');
    },
    showHomepage: function (start, end) {
      start = start || '';
      end = end || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./dashboard/dashboard.php?start=' + start + '&end=' + end);
    },
    showIframe: function (url) {
      R.mainPage.openIframe(decodeURIComponent(url));
    },
    showPagesAboutMe: function (op) {
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./my/' + op + '.php');
    },
    showPopup: function (title, url) {
      Dianjoy.popup.Manager.popup(title, decodeURIComponent(url), false, true, true);
    },
    showPublisherPage: function (op, status) {
      status = status || '';
      R.mainPage
          .setBreadcrumb()
          .openSubPage('./publisher/' + op + '.php?status=' + status);
    },
    showStatPages: function (op, start, end, id, other) {
      start = start || '';
      end = end || '';
      id = id || '';
      other = other || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./stat/' + op + '.php?start=' + start + '&end=' + end + '&id=' + id + '&other=' + other);
    },
    showUserPages: function (op, param, end) {
      param = param || '';
      end = end || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./user/' + op + '.php?param=' + param + '&end=' + end);
    },
    showSystemPage: function (op, start, end, id) {
      start = start || '';
      end = end || '';
      id = id || '';
      R.mainPage
        .setBreadcrumb()
        .openSubPage('./system/' + op + '.php?start=' + start + '&end=' + end + '&id=' + id);
    }
  });
})(Nervenet.createNameSpace('Dianjoy.admin.router'));
