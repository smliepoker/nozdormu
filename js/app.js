$(function () {
  'use strict';
  var context = Nervenet.createContext()
    , mediator = new dianjoy.model.PageMediator()
    , mainPage = new dianjoy.view.MainPage({
      el: '#main-page, #sidebar, #footer',
      model: mediator
    })
    , subPage = new dianjoy.view.SubPage({
      el: '#sub-page',
      model: mediator
    })
    , router = new dianjoy.router.AdminPanel(mainPage);

  context.mapValue('mainPage', mainPage);
  context.mapValue('subPage', subPage);
  context.mapValue('router', router);
  context.inject(router);

  subPage.on('load:start', mainPage.showLoading, mainPage);
  subPage.on('load:complete', mainPage.removeLoading, mainPage);
  subPage.on('load:failed', mainPage.showErrorAlert, mainPage);
  
  // 服务器返回消息全局处理
  dianjoy.service.Manager.autoUpload = true;
  dianjoy.service.Manager.on('complete', function (response) {
    if (response.refresh) {
      Backbone.history.loadUrl(Backbone.history.fragment);
    }
    if (response.hasOwnProperty('url')) {
      if (response.url === location.hash) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      } else {
        router.navigate(response.url);
      }
    }
  });

  // 弹窗控制
  dianjoy.popup.mediator = mediator;

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', GAid);  // Replace with your property ID.
  ga('send', 'pageview');

  // 路由开始;
  if (!Backbone.history.start()) {
    router.navigate('#/');
  }

  // 用于小屏幕
  if ($('#sidebar-toggle').is(':hidden')) {
    $('#top-bar .collapse').addClass('in');
  }
});
dianjoy.chartColors = [
  '#e5412d',
  '#f0ad4e',
  '#444',
  '#888',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#2C3E50',
  '#F39C12',
  '#D35400',
  '#C0392B',
  '#BDC3C7',
  '#7F8C8D'];
var URL = window.URL || window.webkitURL;
