/* eslint-disable no-undef */
$(function() {
  //remove errors
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  }

  //clear
  $('.post-form input, #post-body').on('focus', function() {
    removeErrors();
  });

  //publish
  $('.publish-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val()
    };

    $.ajax({
      type: 'Post',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {
      if (!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        $(location).attr('href', '/');
      }
    });
  });

  // upload image
  $('#fileinfo').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
      type: 'Post',
      url: '/upload/image',
      data: formData,
      processData: false,
      contentType: false,
      success: function(r) {
        console.log(r);
      },
      error: function(e) {
        console.log(e);
      }
    });
  });
});

/* eslint-enable no-undef */
