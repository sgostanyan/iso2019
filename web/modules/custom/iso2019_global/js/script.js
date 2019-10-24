(function ($, Drupal) {
  Drupal.behaviors.iso2019Behavior = {
    attach: function (context, settings) {
     $('.next-step').click(function(e){
       e.preventDefault();
     });
    }
  };
})(jQuery, Drupal);
