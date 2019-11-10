(function ($, Drupal) {
  Drupal.behaviors.iso2019Behavior = {
    attach: function (context, settings) {

      // Add tooltip.
      $('.form-item-attics label').once().append('<span data-toggle="tooltip" data-placement="right" title="Les combles perdus sont des combles non aménageables et non habitables." class="Tooltip"><img src="modules/custom/iso2019_global/images/infobulle.png" alt=""></span>');
      $('.Tooltip').tooltip();

      // Phone field validate.
      $('#edit-telephone').once().change(function () {
        $('.phone-mess').remove();
        if (!validatePhoneNumber($(this).val())) {
          $('.form-item-telephone').append('<div class="phone-mess" style="color: red; margin-top: 0.5em;">Vous devez entrer un numéro de téléphone valide</div>');
          $('#edit-actions-submit').attr('disabled');
        }
        $('#edit-actions-submit').removeAttr('disabled');
      });

      // Manage fiscal brackets by county and number persons.

      $('#edit-county, #edit-number-person').bind('keyup mouseup change', function () {
        var county = $('#edit-county').val();
        var numbPerson = $('#edit-number-person').val();
        if (county && numbPerson && numbPerson != 0) {
          var amount = calculateFiscalCeiling(county, numbPerson);
          $('label[for="edit-fiscal-brackets-ok"]').html('inférieur à ' + amount);
          $('label[for="edit-fiscal-brackets-nok"]').html('supérieur à ' + amount);
          $('.form-item-fiscal-brackets').show();
        }
        else {
          $('.form-item-fiscal-brackets').hide();
        }
      });

      // Click on next step.
      $('.next-step').once().click(function () {
        checkDataValidation();
      });

      // Functions
      function checkDataValidation() {
        var formData = $('.iso2019-forms form').serializeArray();
        console.log(formData);
        var data = formatData(formData);
        $('#edit-not-eligible, #edit-eligible').hide();
        $('.field-requ-mess').remove();

        if (!formData[data.indexKeys.county].value) {
          messenger('Voir devez choisir un département');
          return;
        }

        // Type de logement.
        if (data.keys.indexOf('housing_type') !== -1) {

          // Si logement appartement.
          if (formData[data.indexKeys.housing_type].value === 'appartment') {
            eligible(false, 'les appartements ne sont pas inclus dans l\'offre.');
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
                  eligible(false, 'les combles aménagés ne sont pas inclus dans l\'offre.');
                  return;
                }

                // Si type de combles perdus.
                else if (formData[data.indexKeys.attic_type].value === 'lost') {

                  // Si pas de renseignement sur les revenus fiscaux.
                  if (formData[data.indexKeys.number_person].value === '' ||
                    data.keys.indexOf('fiscal_brackets') === -1) {
                    messenger('Vous devez renseigner tous les champs pour vos combles perdus');
                    return;
                  }

                  // Calcul de l'éligibilité fiscal.
                  else {
                    var result = formData[data.indexKeys.fiscal_brackets].value === 'ok';
                    var message = !result ? 'vos revenus dépassent le plafond autorisé pour les combles perdus.' : '';
                    eligible(result, message);
                    if (!result) {
                      return;
                    }

                  }
                }
              }
              else {
                $('#edit-attic-section input').removeAttr('required');
              }

              // Si pas de surface total.
              if (formData[data.indexKeys.total_area].value === '') {
                eligible(false, 'Vous devez renseigner la surface totale à isoler.');
                return;
              }

              // Si pas de type de chauffage.
              if (formData[data.indexKeys.heating_type].value === '') {
                eligible(false, 'Vous devez renseigner le type de chauffage.');
                return;
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

      function eligible(status, message) {

        $('.field-requ-mess').remove();
        var notEligible = $('#edit-not-eligible');
        var eligible = $('#edit-eligible');
        notEligible.hide();
        eligible.hide();

        if (!status) {
          var messElement = notEligible.find('p');
          var text = messElement.html();
          notEligible.html('Désolé, vous n\'êtes pas éligible: ' + message);
        }

        status ? eligible.show() : notEligible.show();
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

      function calculateFiscalCeiling(region, numberPersons) {

        var idf = ['75', '77', '78', '91', '92', '93', '94', '95'];
        region = idf.indexOf(region) !== -1 ? 'idf' : 'notIdf';
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
          return incomeCeiling[numberPersons][region].toLocaleString() + ' euros';
        }
        else if (numberPersons > 5) {
          return (incomeCeiling[5][region] + ((numberPersons - 5) * majoration[region])).toLocaleString() + ' euros';
        }
      }

      function validatePhoneNumber(number) {
        var reg = new RegExp("^0[1-9]([-. ]?[0-9]{2}){4}$");
        return reg.test(number);
      }

    }
  };
})(jQuery, Drupal);
