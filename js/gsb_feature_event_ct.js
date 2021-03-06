(function ($) {
  Drupal.behaviors.gsb_feature_event_ct = {
    attach: function (context, settings) {

      // clear the registration date field if this is a new node
      var currentNid = Drupal.settings.gsb_feature_event_ct.currentNid;
      if (currentNid == null) {
        $('#edit-field-date-time-und-0-value-timeEntry-popup-1').val('');
      }

      // speakers
      $("input[name$='[field_person_ref][und][0][target_id]']").each(function() {
        var index = Drupal.gsb_feature_event_ct.get_speaker_index($(this));
        if (index != -1) {
          $(this).data('item_index', index);
        }
      });
      $("input[name$='[field_person_ref][und][0][target_id]']").on('blur', function(e) {
        $(this).addClass('speaker-completed');
        setTimeout("Drupal.gsb_feature_event_ct.lookup_speaker()", 100);
      });

      // hide the require * if the event detail is set to 'Link to an existing page'
      // for the 'Open URL in a New Window' checkbox on the Title URL field. Wee.
      $('#edit-field-event-detail-und-1').on('change',function() {
        if ($('#edit-field-event-detail-und-1').is(':checked')) {
          $("label[for=edit-field-link-single-und-0-attributes-target]").children().hide();
        }
      });

      var cleanupFieldsets = function($event) {

         var hide_fieldgroups = {
           Image: "Image",
           Description : "Description *",
           WhoShouldAttend: "Who Should Attend",
           Speakers: "Speakers",
           RegistrationPricing: "Registration & Pricing",
           Schedule: "Schedule",
           Sponsors: "Sponsors",
           ContactInformation: "Contact Information"
         };

         $(".field-group-tabs-wrapper  .vertical-tab-button").each(function () {
           for (var key in hide_fieldgroups) {
             if ($event == 1) {
               if (hide_fieldgroups[key] == $(this).text()) {
                 $(this).hide();
               }
             }
             else {
               $(this).show();
             }

           }
         });
      } // end of cleanupFieldsets

      $(document).ready(function() {
        $("[id^=edit-field-event-detail-und-]").on('change', function () {
          cleanupFieldsets($(this).val());
        });

        // clear the fields based on speaker type
        $("[name*='[field_speakers_person_type][und]']").each(function(){
          $(this).on('change', function () {
            key = $(this).attr('id').match(/\d+/);
            if ($(this).val() == 1) {
              $("[name='field_event_speakers[und]["+key+"][field_person_ref][und][0][target_id]']").val('');
              $("[name='field_event_speakers[und]["+key+"][field_title][und][0][value]']").val('');
            }
            else {
              $("[name='field_event_speakers[und]["+key+"][field_first_name][und][0][value]']").val('');
              $("[name='field_event_speakers[und]["+key+"][field_last_name][und][0][value]']").val('');
              $("[name='field_event_speakers[und]["+key+"][field_link_single][und][0][url]']").val('');
            }
          });
        });

      });

    } // end attach
  }

  Drupal.gsb_feature_event_ct = Drupal.gsb_feature_event_ct || {}

  // speaker functions

  Drupal.gsb_feature_event_ct.get_speaker_index = function(element) {
    var index = -1;
    var name = $(element).attr('name');
    var find = 'field_event_speakers[und][';
    var part1 = name.indexOf(find);
    if (part1 != -1) {
      name = name.replace(find, '');
    }
    var part2 = name.indexOf(']');
    if (part2 != -1) {
      index = name.substring(0,part2);
    }
    return index;
  }
  Drupal.gsb_feature_event_ct.lookup_speaker = function() {
    var speaker_info = $('.speaker-completed').val();
    if (speaker_info == undefined) {
      return;
    }
    var pos_start = speaker_info.indexOf(' (');
    var pos_end = speaker_info.indexOf(')',speaker_info.length-1);
    var nid = -1;
    if (pos_start != -1 && pos_end != -1) {
      nid = speaker_info.substring(pos_start+2,pos_end);
    }
    var index = $('.speaker-completed').data('item_index');
    $.getJSON(Drupal.settings.basePath + 'gsb_feature_event_ct_speaker_lookup/' + nid + '/' + index, function(data) {
      $("input[id^='edit-field-event-speakers-und-" + data.index + "-field-title-und-0-value']").val(data.title);
    });
    $('.speaker-completed').removeClass('speaker-completed');
  }

})(jQuery);