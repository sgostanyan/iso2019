(function ($, Drupal) {
  Drupal.behaviors.iso2019Behavior = {
    attach: function (context, settings) {

      // Add tooltip.
      $('.form-item-attics label').once().append('<span data-toggle="tooltip" data-placement="right" title="Les combles perdus sont des combles non aménageables et non habitables." class="Tooltip"><img src="modules/custom/iso2019_global/images/infobulle.png" alt=""></span>');
      $('.Tooltip').tooltip();

      // Click on next step.
      $('.next-step').once().click(function () {
        checkDataValidation();
      });

      // Phone field validate.
      $('#edit-telephone').once().change(function () {
        $('.phone-mess').remove();
        if (!validatePhoneNumber($(this).val())) {
          $('.form-item-telephone').append('<div class="phone-mess" style="color: red; margin-top: 0.5em;">Vous devez entrer un numéro de téléphone valide</div>');
          $('#edit-actions-submit').attr('disabled');
        }
        $('#edit-actions-submit').removeAttr('disabled');
      });

      // Functions
      function checkDataValidation() {
        var formData = $('.iso2019-forms form').serializeArray();
        console.log(formData);
        var data = formatData(formData);
        $('#edit-not-eligible, #edit-eligible').hide();
        $('.field-requ-mess').remove();

        // Type de logement.
        if (data.keys.indexOf('housing_type') !== -1) {

          // Si logement appartement.
          if (formData[data.indexKeys.housing_type].value === 'appartment') {
            eligible(false);
            return;
          }

          // Si logement maison.
          else {

            // Si pas de type de pièce choisis.
            if (data.keys.indexOf('attics') === -1 &&
              data.keys.indexOf('garage') === -1 &&
              data.keys.indexOf('cave') === -1 &&
              data.keys.indexOf('crawl_space') === -1) {
              messenger('Vous devez choisir un type de pièce');
              return;
            }
            // Si type de pièce choisis.
            else {

              // Si combles choisis.
              if (data.keys.indexOf('attics') !== -1) {

                // Si pas de type de combles.
                if (data.keys.indexOf('attic_type') === -1) {
                  messenger('Vous devez choisir un type de comble');
                  return;
                }

                // Si type de combles aménagés.
                else if (formData[data.indexKeys.attic_type].value === 'inhabited') {
                  eligible(false);
                  return;
                }

                // Si type de combles perdus.
                else if (formData[data.indexKeys.attic_type].value === 'lost') {

                  // Si pas de renseignement sur les revenus fiscaux.
                  if (data.keys.indexOf('region') === -1 ||
                    formData[data.indexKeys.number_person].value === '' ||
                    formData[data.indexKeys.fiscal_brackets].value === '') {
                    messenger('Vous devez renseigner tous les champs pour vos combles perdus');
                    return;
                  }

                  // Calcul de l'éligibilité.
                  else {
                    var region = formData[data.indexKeys.region].value;
                    var numbPerson = formData[data.indexKeys.number_person].value;
                    var fiscalBrackets = formData[data.indexKeys.fiscal_brackets].value;
                    var result = calculateFiscalEligibility(region, numbPerson, fiscalBrackets);
                    eligible(result);
                  }
                }
              }
              else {
                $('#edit-attic-section input').removeAttr('required');
              }

              // Si autres type de pièce.
              if (data.keys.indexOf('garage') !== -1 ||
                data.keys.indexOf('cave') !== -1 ||
                data.keys.indexOf('crawl_space') !== -1) {
                eligible(true);
              }
            }
          }
        }
        else {
          messenger('Vous devez choisir un type de logement');
          return;
        }
      }

      function messenger(message) {
        $('.field-requ-mess').remove();
        $('#edit-next-step-button').append('<div class="field-requ-mess" style="color: red; font-weight: bold">' + message + '</div>');
      }

      function eligible(status) {
        $('.field-requ-mess').remove();
        $('#edit-not-eligible, #edit-eligible').hide();
        status ? $('#edit-eligible').show() : $('#edit-not-eligible').show();
        status ? $('#edit-contact').css('display', 'flex') : $('#edit-contact').hide();
        status ? $('#edit-actions-submit').show() : $('#edit-actions-submit').hide();
      }

      function formatData(formData) {
        let keys = [];
        let indexKeys = [];

        formData.forEach((item, index) => {
          keys.push(item.name);
          indexKeys[item.name] = index;
        });
        return {'keys': keys, 'indexKeys': indexKeys};
      }

      function calculateFiscalEligibility(region, numberPersons, income) {
        var incomeCeiling = {
          1: {
            'idf': 24918,
            'notIdf': 18960,
          },
          2: {
            'idf': 36572,
            'notIdf': 27729,
          },
          3: {
            'idf': 42924,
            'notIdf': 33346,
          },
          4: {
            'idf': 51289,
            'notIdf': 38958,
          },
          5: {
            'idf': 58674,
            'notIdf': 44592,
          },
        };
        var majoration = {
          idf: 7377,
          notIdf: 5617,
        };

        if (numberPersons >= 1 && numberPersons <= 5) {
          return income > incomeCeiling[numberPersons][region] ? false : true;
        }
        else if (numberPersons > 5) {
          return income > incomeCeiling[5][region] + ((numberPersons - 5) * majoration[region]) ? false : true;
        }
      }

      function validatePhoneNumber(number) {
        var reg = new RegExp("^0[1-9]([-. ]?[0-9]{2}){4}$");
        return reg.test(number);
      }

    }
  };
})(jQuery, Drupal);
