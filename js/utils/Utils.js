(function (ns) {
  var interval;
  
  function base64(string) {
    return window.btoa(decodeURIComponent(encodeURIComponent(string)));
  }
  
  _.extend(ns, {
    clearLoop: function () {
      clearInterval(interval);
      return this;
    },
    deleteRow: function (btn) {
      var msg = btn.attr('msg') ? btn.attr('msg') : '删除之后无法复原，您确定么？';
      if (window.confirm(msg)) {
        btn.addClass('disabled');
        dianjoy.service.Manager.call(btn.attr('href'), null, this.deleteRow_successHandler, this.deleteRow_errorHandler, btn);
      }
    },
    tableToExcel: function (tableList, name) {
      var tables = [],
          uri = 'data:application/vnd.ms-excel;base64,',
          template = Handlebars.compile('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{{worksheet}}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{{#each tables}}<table>{{{this}}}</table>{{/each}}</body></html>');
        
      for (var i = 0; i < tableList.length; i++) {
        tables.push(tableList[i].innerHTML);
      }
      var data = {
        worksheet: name || 'Worksheet',
        tables: tables
      };
      return uri + base64(template(data));
    },
    deleteRow_successHandler: function (response) {
      "use strict";
      this.closest('tr').fadeOut(function () {
        $(this).remove();
        $('#' + response.id).remove();
      });
    },
    deleteRow_errorHandler: function (response) {
      "use strict";
      alert(response.msg);
      this.removeClass('disabled');
    }
  });
  _.extend(ns, Backbone.Events);
}(Nervenet.createNameSpace('dianjoy.utils')));
