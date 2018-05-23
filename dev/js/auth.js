/* eslint-disable no-undef */

$(function() {
  //remove errors
  function removeErrors() {
    $('form.login p.error, form.registration p.error').remove();
    $('form.login input, form.registration input').removeClass('error');
  }

  //toggle
  var flag = true;
  $('.switch-button').on('click', function(e) {
    e.preventDefault();

    $('input').val('');
    removeErrors();
    $('input').removeClass('error');
    if (flag) {
      flag = false;
      $('.registration').show('slow');
      $('.login').hide();
    } else {
      flag = true;
      $('.login').show('slow');
      $('.registration').hide();
    }
  });

  //clear
  $('form.login input, form.registration input').on('focus', function() {
    removeErrors();
  });

  //register
  $('.registration-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();
    $('input').removeClass('error');
    var data = {
      login: $('#registration-login').val(),
      password: $('#registration-password').val(),
      passwordConfirm: $('#registration-password-confirm').val()
    };

    $.ajax({
      type: 'Post',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/register'
    }).done(function(data) {
      if (!data.ok) {
        $('.registration h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        // $('.registration h2').after(
        //   '<p class="success">Success! You are welcome!</p>'
        // );
        $(location).attr('href', '/');
      }
    });
  });

  //authorization
  $('.login-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();
    $('input').removeClass('error');
    var data = {
      login: $('#login-login').val(),
      password: $('#login-password').val()
    };

    $.ajax({
      type: 'Post',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/login'
    }).done(function(data) {
      if (!data.ok) {
        $('.login h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        $(location).attr('href', '/');
      }
    });
  });
});

/* eslint-enable no-undef */
