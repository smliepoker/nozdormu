(function (ns) {
  var interval;
  
  function base64(string) {
    return window.btoa(unescape(encodeURIComponent(string)));
  }
  function format(string, c) {
    return string.replace(/{(\w+)}/g, function(m, p) {
      return c[p]; 
    });
  }
  function getExtension(filename) {
    return filename.substr(filename.lastIndexOf('.') + 1);
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
    formatDate: function (date, format) {
      format = format.replace(/y{2,}/ig, date.getFullYear());
      format = format.replace(/m{2,}/ig, date.getMonth());
      format = format.replace(/d{2,}/ig, date.getDate());
      return format;
    },
    getMaxDate: function (offset, select, curr) {
      curr = new Date(curr);
      var today = new Date(),
          date = new Date(select);
      today.setDate(today.getDate() - 90);
      date.setDate(date.getDate() + offset);
      return date > today ? (curr > date ? curr : date) : (curr > today ? curr : today);
    },
    getMinDate: function (offset, select, curr) {
      curr = new Date(curr);
      var today = new Date(),
          date = new Date(select);
      date.setDate(date.getDate() + offset);
      return date < today ? (curr < date ? curr : date) : (curr < today ? curr : today);
    },
    getParamObject: function (str) {
      str = str.substr(0, 1) === '?' ? str.substr(1) : str;
      var obj = {},
          arr = str.split('&');
      for (var i = 0, len = arr.length; i < len; i++) {
        var kv = arr[i].split('=');
        obj[kv[0]] = kv[1];
      }
      return obj;
    },
    getParamQuery: function (obj) {
      var str = '?';
      for (var prop in obj) {
        str += prop + '=' + obj[prop] + '&';
      }
      return str.slice(0, -1);
    },
    setLoop: function (func, delay) {
      clearInterval(interval);
      interval = setInterval(func, delay);
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
