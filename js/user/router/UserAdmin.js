(function (ns) {
  var page,
      init = {
        initialize: function (options) {
          page = options;
        },
        routes: {
          'home': 'showHomepage',
          'help/:op': 'showHelp',
          'app/:op': 'showApps',
          'app/:op/:id': 'showApps',
          'app/adlist/:id/:order': 'showAdlist',
          'apply/:op': 'showApply',
          'report/:op': 'showReport',
          'report/:op/:start': 'showReport',
          'report/:op/:start/:end': 'showReport',
          'report/:op/:start/:end/:id': 'showReport',
          'reward/:op': 'showReward',
          'user': 'showUser',
          'user/:op': 'showUser',
          'user/imei/:appid/:imei': 'showUserByImei',
        },
        showAdlist: function (id, order) {
          page.openSubPage('app/app-adlist.php?id=' + id + '&order=' + order);
        },
        showApply: function (op) {
          page.openSubPage('user/apply-' + op + '.php');
        },
        showApps: function (op, id) {
          id = id || '';
          page.openSubPage('app/app-' + op + '.php?id=' + id);
        },
        showHelp: function (op) {
          page.openSubPage('help/' + op + '.html');
        },
        showHomepage: function () {
          page.openSubPage('user/home.php');
        },
        showReport: function (op, start, end, id) {
          start = start || '';
          end = end || '';
          id = id || '';
          page.openSubPage('app/report-' + op + '.php?start=' + start + '&end=' + end + '&id=' + id);
        },
        showUser: function (op) {
          op = op || 'user';
          page.clearSubNavi();
          page.openSubPage('user/' + op + '.php');
        },
        showUserByImei: function (appid, imei) {
          page.openSubPage('user/imei.php?appid=' + appid + '&imei=' + imei);
        },
        showReward: function (op) {
          op = op || 'list';
          page.openSubPage('user/reward-' + op + '.php');
        }
      };
  ns.UserAdmin = Backbone.Router.extend(init);
}(Nervenet.createNameSpace('Dianjoy.user.router')));
