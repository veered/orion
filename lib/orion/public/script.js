var Orion = Orion || {
  service_url: '/services',
  diff_url: '/diff',
  interval: 10000,
  time: -1,

  services: {}
};

$(document).ready(function () {

  sortHash = function(hash){
    sortedKeys = [];
    sortedHash = {};

    for (var i in hash){
      sortedKeys.push(i);
    }
    sortedKeys.sort();

    for (i in sortedKeys) {
      sortedHash[sortedKeys[i]] = hash[sortedKeys[i]];
    }
    return sortedHash;
  };

  noOffset = function(s) {
    var day= s.slice(0,-5).split(/\D/).map(function(itm){
        return parseInt(itm, 10) || 0;
      });
      day[1]-= 1;
      day= new Date(Date.UTC.apply(Date, day));
      var offsetString = s.slice(-5)
      var offset = parseInt(offsetString,10)/100;
      if (offsetString.slice(0,1)=="+") offset*=-1;
        day.setHours(day.getHours()+offset);
      return day.getTime();
  }

  convertUTCtoLocal = function(date) {
    date = new Date(noOffset(date));
    return date.toLocaleTimeString() + ', ' + date.toLocaleDateString();
  };

  updateFilter = function() {
    now = new Date();
    $('#date').attr('value', (now.getMonth()+1) + '/' + now.getDate() + '/' + now.getFullYear());
    $('#time').attr('value', now.toLocaleTimeString());
  };

  getHeader = function(name, value) {
    header = $([
      '<tbody class="head head_highlight">',
      '<tr>',
      '<td>' + name + '</td>',
      '<td> type </td>',
      '<td> status </td>',
      '<td> build </td>',
      '<td> config path </td>',
      '<td> timestamp </td>',
      '</tr>',
      '</tbody>'
    ].join('\n'));

    header.find('td:first-child').click(function() {
      $.fancybox('<div class="json_window"><pre>' + JSON.stringify(value, null, 4) + '</pre></div>' );
    });

    return header;
  };

  getRow = function(name, value) {

    entry = $([
      '<tr>',
      '<td> Slot ' + name + '</td>',
      '<td>' + value.core_type + '</td>',
      '<td>' + value.status + '</td>',
      '<td>' + value.build + '</td>',
      '<td>' + value.config_path + '</td>',
      '<td>' + convertUTCtoLocal(value.timestamp) + '</td>',
      '</tr>'
    ].join('\n'));

    entry.find('td:first-child').click(function() {
      $.fancybox('<div class="json_window"><pre>' + JSON.stringify(value, null, 4) + '</pre></div>' );
    });

    return entry;
  };

  showDiff = function(service) {

    wrapper = $('<div><div class="datagrid json_window"></div></div>');
    datagrid = wrapper.find('.datagrid');

    $.ajax({ url: Orion.diff_url, data: { name: service} }).done(function(result) {
      table = $('<table></table>');

      header = $([
        '<tbody class="head">',
        '<tr>',
        '<td> timestamp </td>',
        '<td> type </td>',
        '<td> status </td>',
        '<td> build </td>',
        '<td> config path </td>',
        '</tr>',
        '</tbody>'
      ].join('\n'));
      table.append(header);

      list = $('<tbody class="list"></tbody>');
      $.each(result, function(index, value) {
        timestamp = convertUTCtoLocal(value.timestamp);

        entry = $([
          '<tr>',
          '<td> ' + timestamp + '</td>',
          '<td>' + value.core_type + '</td>',
          '<td>' + value.status + '</td>',
          '<td>' + value.build + '</td>',
          '<td>' + value.config_path + '</td>',
          '</tr>'
        ].join('\n'));

        list.append(entry);
      });
      table.append(list);

      datagrid.append(table);
      $.fancybox(wrapper.html(), {padding: 0, background: 'blue'});
    });

  };

  displayServices = function() {
    if (Orion.time == -1)
      updateFilter();

    table = $('#service_list');
    table.empty();

    $.each(Orion.services, function(service, slots) {
      table.append(getHeader(service, slots));

      list = $('<tbody class="list list_highlight"></tbody>');
      $.each(slots, function(slot, value){
        if (value.core_type === null)
          return;

        row = getRow(slot, value);
        (function(row, value) {
          row.mouseover(function() {
            img = $('#history');

            offset = row.offset();
            img.offset({ top: offset.top + row.height()/2 - img.height()/2, left: offset.left + row.width() + 15 });

            img.unbind();
            img.click(function() { showDiff(value.name); });
          });
        })(row, value);

        list.append(row);
      });

      table.append(list);
    });
  };

  updateServices = function() {
    params = {};
    if (Orion.time != -1)
      params.date = Orion.time;

    $.ajax({ url: Orion.service_url, data: params }).done(function(result) {
      services = {};

      $.each(result, function(key, value) {
        value.name = key;

        matches = key.match(/(.*)-s(.*)\/.*/);
        if (matches === null)
          return;

        service = services[matches[1]] = services[matches[1]] || {};
        service[matches[2]] = value;
      });

      Orion.services = sortHash(services);
      displayServices();
    });
  };

  $('#filter').click(function() {
    d = new Date($('#date').val() + ' ' + $('#time').val());
    Orion.time = d.getTime()/1000;

    updateServices();
  });

  updateServices();
  Orion.timer = window.setInterval(updateServices, Orion.interval);

  $('#date, #time').keydown(function() {
    window.clearInterval(Orion.timer);
  });

  $('#history').offset({top: -100, left: -100});

});