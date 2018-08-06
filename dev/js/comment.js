/* eslint-disable no-undef */
$(function() {
  var commentForm;
  var parentId;

  // add form
  $('#new, #reply').on('click', function() {
    parentId = null;

    if (commentForm) {
      commentForm.remove();
    }

    commentForm = $('.comment').clone(true, true);

    if ($(this).attr('id') === 'new') {
      commentForm.appendTo('.comment-list');
    } else {
      var parentComment = $(this).parent();
      parentId = parentComment.attr('id');
      $(this).after(commentForm);
    }

    commentForm.css({ display: 'flex' });
  });

  // cancel form
  $('form.comment .cancel').on('click', function(e) {
    e.preventDefault();
    commentForm.remove();
  });

  // publish
  $('form.comment .send').on('click', function(e) {
    e.preventDefault();
    // removeErrors();

    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      if (!data.ok) {
        if (data.error === undefined) {
          data.error = 'Unknown error';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        var newComment =
          '<ul><li><div class="head"><a href="/users/' +
          data.login +
          '">' +
          data.login +
          '</a><span class="date"></span></div>' +
          data.body +
          '<span class="link" id="reply">Answer</span></li></ul>';

        $(commentForm).after(newComment);
        commentForm.remove();
      }
    });
  });
});

/* eslint-enable no-undef */
