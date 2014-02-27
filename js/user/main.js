$(function () {
  'use strict';
  var mediator = new Dianjoy.component.model.NavbarTableMediator();
  var mainPage = new Dianjoy.user.view.MainPage({
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
  Dianjoy.popup.mediator = mediator;

  // 路由
  R.router = new Dianjoy.user.router.UserAdmin(mainPage);
  var check = Backbone.history.start({
    root: '/Dianjoy/'
  });
  if (!check) {
    R.router.navigate('#/home');
  }

  // 开启最近的活动
  if (Dianjoy.user.hasOwnProperty('activities')) {
    Dianjoy.user.activities.Invite.start();
  }
  
  // 延迟加载Google Chart API
  var script = document.createElement('script');
  script.src = '//www.google.com/jsapi';
  script.onload = function (event) {
    if (window.google) {
      loadGoogleChart();
    }
  };
  $('head').append(script);
  var gchartInterval = setInterval(function () {
    if (window.google) {
      clearInterval(gchartInterval);
      loadGoogleChart();
    }
  }, 1000);
  
  // prepare Google Charts
  function loadGoogleChart() {
    google.load('visualization', '1.0', {
      packages: ['corechart'],
      callback: function() {
        Dianjoy.utils.trigger('google:ready');
      }
    });
  }

  // GA
  _gaq.push(['_setAccount', 'UA-35957679-1']);
  _gaq.push(['_setDomainName', 'dianjoy.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

});
var R = {},
    _gaq = [];