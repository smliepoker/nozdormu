$(function () {
  'use strict';
  var mediator = new Dianjoy.model.PageMediator(),
      notifications = new Dianjoy.model.NotificationCollection();
  R.mainPage = new Dianjoy.admin.view.MainPage({
    el: '#main-page, #sidebar, #footer',
    model: mediator
  });
  var notificationPanel = new Dianjoy.notification.NotificationPanel({
    collection: notifications,
    el: '#notification'
  });
  
  // 表单提交完成
  Dianjoy.service.Manager.autoUpload = true;
  Dianjoy.service.Manager.on('complete', function (response) {
    if (response.refresh) {
      Backbone.history.loadUrl(Backbone.history.fragment);
    }
    if (response.hasOwnProperty('url')) {
      if (response.url === location.hash) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      } else {
        R.router.navigate(response.url);
      }
    }
  });

  // 通知系统
  Dianjoy.notification.Manager.init({
    el: '#howl',
    collection: notifications
  });

  //全局搜索
  var search = new Dianjoy.view.Search({
    el: '#search'
  });

  Dianjoy.popup.mediator = mediator;

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-35957679-5');  // Replace with your property ID.
  ga('send', 'pageview');

  // 路由
  R.router = new Dianjoy.admin.router.AdminPanel(R.mainPage);
  var check = Backbone.history.start({
    root: '/Dianjoy/'
  });
  if (!check) {
    R.router.navigate('#/home');
  }

  if ($('#sidebar-toggle').is(':hidden')) {
    $('#top-bar .collapse').addClass('in');
  }
});
var R = {
      chartColors: ['#e5412d', '#f0ad4e', '#444', '#888', '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#F39C12', '#D35400', '#C0392B', '#BDC3C7', '#ASBESTOS']
    },
    URL = window.URL || window.webkitURL;
