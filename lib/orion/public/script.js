var Orion = Orion || {
  url: '/',
  interval: 10000,
  time: -1,

  services: {}
};

$(document).ready(function () {

  updateFilter = function() {
    now = new Date();
    $('#date').attr('value', (now.getMonth()+1) + '/' + now.getDate() + '/' + now.getFullYear());
    $('#time').attr('value', now.toLocaleTimeString());
  };

  displayServices = function() {
    if (Orion.time == -1)
      updateFilter();

    table = $('.datagrid table');
    table.empty();

    $.each(Orion.services, function(service, slots) {

      table.append([
        '<tbody class="head">',
        '<tr>',
        '<td>' + service + '</td>',
        '<td> type </td>',
        '<td> status </td>',
        '<td> build </td>',
        '<td> config path </td>',
        '<td> started </td>',
        '</tr>',
        '</tbody>'
      ].join('\n'));

      service_box = $('.datagrid .head tr td:first-child').last();
      service_box.click(function() {
        $.fancybox('<div class="json_window"><pre>' + JSON.stringify(slots, null, '\t') + '</pre></div>' );
      });

      list = $('<tbody class="list"></tbody>');
      $.each(slots, function(slot, value){
        if (value.core_type === null)
          return;

        last_start = 'Unknown';
        if (value.last_start_time !== null) {
          datetime = new Date(value.last_start_time + ' UTC');
          last_start = datetime.toLocaleTimeString() + ', ' + datetime.toLocaleDateString();
        }

        entry = $([
          '<tr>',
          '<td> Slot ' + slot + '</td>',
          '<td>' + value.core_type + '</td>',
          '<td>' + value.status + '</td>',
          '<td>' + value.build + '</td>',
          '<td>' + value.config_path + '</td>',
          '<td>' + last_start + '</td>',
          '</tr>'
        ].join('\n'));

        entry.find('td').first().click(function() {
          $.fancybox('<div class="json_window"><pre>' + JSON.stringify(value, null, '\t') + '</pre></div>' );
        });

        list.append(entry);
      });

      table.append(list);
    });
  };

  updateServices = function() {
    params = {};
    if (Orion.time != -1)
      params.date = Orion.time;

    $.ajax({ url: Orion.url, data: params }).done(function(result) {
      services = {};

      $.each(result, function(key, value) {
        matches = key.match(/(.*)-s(.*)\/.*/);
        if (matches === null)
          return;

        service = services[matches[1]] = services[matches[1]] || {};
        service[matches[2]] = value;
      });

      Orion.services = services;
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

});