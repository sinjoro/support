initAutoSize = () ->
  $('textarea').autosize({append: "\n"})
  $('textarea').addClass('textarea-transition')

#submit form on CTRL+ENTER
catchKeys = () ->
  $(document).on 'keydown', (event) ->
    if event.ctrlKey and event.keyCode == 13
      $target = $(event.target)
      #first let's try to sumbit parents form if it exist.
      $parentForm = $target.parents('form');
      #then any other form
      $form = $('form') if $parentForm.length!=0
      #finally submit it
      $form.find('button[type="submit"]').click() if $form.length == 1

catchKeys()
initAutoSize()