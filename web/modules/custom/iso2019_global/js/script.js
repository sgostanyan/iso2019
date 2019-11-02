(function ($, Drupal) {
  Drupal.behaviors.iso2019Behavior = {
    attach: function (context, settings) {

      $('.form-item-attics label').once().append('<span data-toggle="tooltip" data-placement="right" title="Les combles perdus sont des combles non aménageables et non habitables." class="Tooltip"><img src="modules/custom/iso2019_global/images/infobulle.png" alt=""></span>');
      $('.Tooltip').tooltip();

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

        var requiredElements = [
          'county',
          'housing_type',
          'total_area',
          'heating_type',
        ];
        var roomType = [
          'attics',
          'cave',
          'garage',
          'crawl_space'
        ];
        var atticsRequired = [
          'attic_type',
        ];
        var atticLostRequired = [
          'region',
          'number_person',
          'fiscal_brackets'
        ];

        // Type de logement.
        if (data.keys.indexOf('housing_type') !== -1) {
          if (formData[data.indexKeys.housing_type].value == 'appartment') {
            eligible(false);
            return;
          }
          else {
            // Type de combles.
            if (data.keys.indexOf('attics') === -1 &&
              data.keys.indexOf('garage') === -1 &&
              data.keys.indexOf('cave') === -1 &&
              data.keys.indexOf('crawl_space') === -1) {
              messenger('Vous devez choisir un type de pièce');
              return;
            }
            else {
              if (data.keys.indexOf('attics') !== -1 && data.keys.indexOf('attic_type') === -1) {
                messenger('Vous devez choisir un type de comble');
                return;
              }
              else if (formData[data.indexKeys.attic_type].value === 'inhabited') {
                eligible(false);
                return;
              }
              else if (formData[data.indexKeys.attic_type].value === 'lost') {
                if (data.keys.indexOf('region') === -1 ||
                  formData[data.indexKeys.number_person].value === '' ||
                  formData[data.indexKeys.fiscal_brackets].value === '') {
                  messenger('Vous devez renseigner tous les champs pour vos combles perdus');
                  return;
                }
                else {
                  var region = formData[data.indexKeys.region].value;
                  var numbPerson = formData[data.indexKeys.number_person].value;
                  var fiscalBrackets = formData[data.indexKeys.fiscal_brackets].value;
                  var result = calculateFiscalEligibility(region, numbPerson, fiscalBrackets);
                  eligible(result);
                }
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
        status ? $('#edit-contact').show() : $('#edit-contact').hide();
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
         return  income > incomeCeiling[numberPersons][region] ? false : true;
        }
        else if (numberPersons > 5) {
          return income > incomeCeiling[5][region] + ((numberPersons - 5) * majoration[region]) ? false : true;
        }
      }
    }
  };
})(jQuery, Drupal);
