(function ($, Drupal) {
  Drupal.behaviors.iso2019Behavior = {
    attach: function (context, settings) {

      $('.form-item-attics label').once().append('<span data-toggle="tooltip" data-placement="right" title="Les combles perdus sont des combles non aménageables et non habitables." class="Tooltip"><img src="modules/custom/iso2019_global/images/infobulle.png" alt=""></span>');
      $('.Tooltip').tooltip();

     $('.next-step').click(function(e){
       e.preventDefault();
     });


     // Functions


    }
  };
})(jQuery, Drupal);
