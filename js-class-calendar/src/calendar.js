var $ = window.$ = window.jQuery = require('jquery');
var moment = require('moment');
var fullcalendar = require('fullcalendar');
var bootstrap = require('bootstrap');
var templates = {
  error: require('./error.hbs'),
  details: require('./details.hbs'),
  summary: require('./summary.hbs')
};

module.exports = function (options) {
  options = options || {};

  var $classes = $(options.container || '#classes');

  $classes.fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,basicWeek,agendaDay'
    },
    defaultDate: '2016-03-01',
    eventLimit: true, // allow "more" link when too many events
    events: fetchEvents,
    eventClick: function (event, ev) {
      details.show(event.data, ev);
    },
    eventMouseover: function (event, ev) {
    },
    eventMouseout: function (event) {
    }
  });

  function fetchEvents (start, end, timezone, callback) {
    var month = start.endOf('week').format('YYYY-MM-DD');
    $.get('/api/classes?month='+month).then(function (classes) {
      callback(classes.map(function (c) {
        return {
          title: c.name + ' (' + (c.slots - c.slotsAvailable) + '/' + c.slots +')',
          start: c.time,
          color: c.color,
          end: moment(c.time).add(c.duration, 'minutes'),
          data: c
        };
      }));
    });
  }

  var details = {
    $details: null,
    data: null,
    show: function (data, ev) {

      this.remove();
      this.data = data;

      var $target = $(ev.currentTarget);
      var $details = this.$details = $(templates.details({
        title: data.name,
        color: data.color,
        description: data.name+' with '+data.calendar+' on '+moment(data.time).format('MMMM Mo, YYYY')+'.',
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email
      }));

      var position = $target.offset();
      $('body').append($details);
      $details
        .on('submit', this.onSubmit.bind(this))
        .on('change', this.onChange.bind(this))
        .modal('show');
    },
    remove: function () {
      var $details = this.$details;
      if ($details) {
        $details.remove();
        this.$details = null;
        this.data = null;
      }
    },

    onChange: function (e) {
      var $input = $(e.target);
      $input.closest('.form-group').toggleClass('has-error', !$input.val());
    },
    onSubmit: function (e) {
      e.preventDefault();
      var $details = this.$details;
      var errors = false;
      $details.find('input[type="text"]').each(function () {
        var $input = $(this);
        var error = !$input.val();
        errors = errors || error;
        $input.closest('.form-group').toggleClass('has-error', error);
      });

      if (!errors) {
        var data = $details.find('form').serializeArray().reduce(function (data, input) {
          data[input.name] = input.value;
          return data;
        }, {
          appointmentTypeID: this.data.appointmentTypeID,
          // calendarID: this.data.calendarID,
          datetime: this.data.time
        });
        $details.find('.carousel').carousel(1).carousel('pause');
        $.ajax('/api/appointment', {
          data: JSON.stringify(data),
          contentType: 'application/json',
          type: 'POST'
        }).then(function (data) {
          $details.find('.summary').html(templates.summary(data));
          $details.find('.carousel').carousel(2).carousel('pause');
        }, function (err) {
          $details.find('.summary').html(templates.error(err.responseJSON));
          $details.find('.carousel').carousel(2).carousel('pause');
        });
      }
    }
  };
};
