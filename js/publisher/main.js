$(function () {
  'use strict';
  var mediator = new Dianjoy.component.model.NavbarTableMediator();
  var mainPage = new Dianjoy.publisher.view.MainPage({
    el: '#main-body, #navbar',
    model: mediator
  });

  // 表单提交完成
  Dianjoy.service.Manager.on('complete', function (response) {
    if (response.hasOwnProperty('url')) {
      if (response.url === location.hash) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      } else {
        R.router.navigate(response.url);
      }
    }
  });

  // 路由
  R.router = new Dianjoy.publisher.router.Publisher(mainPage);
  var check = Backbone.history.start({
    root: '/Dianjoy/'
  });
  if (!check) {
    R.router.navigate('#/stat');
  }

  // 开启最近的活动
  if (Dianjoy.publisher.hasOwnProperty('actDianjoy.publisher.activities.Invite.start();ivities')) {
    Dianjoy.publisher.activities.Invite.start();
  }
  
  // prepare Google Charts
  if (google) {
    google.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: function() {
        Dianjoy.utils.trigger('google:ready');
      }
    });
  }
  
});
var R = {};