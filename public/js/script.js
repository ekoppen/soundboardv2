$(document).ready(function () {
  $("body.no-javascript").removeClass("no-javascript");
  function dateFormatter(value) {
    jQuery.format.prettyDate(value);
  }

  $("audio")
    .attr("onended", "linksAan(this.id)")
    .removeAttr("controls")
    .each(function (i, audioElement) {
      var audio = $(this);
      var that = this;
    
      // Check if this sound is a favorite or hidden
      const soundId = audio.attr("id");
      const isFavorite = StorageHelper.isFavorite(soundId);
      const isHidden = StorageHelper.isHidden(soundId);
      const favoriteClass = isFavorite ? " is-favorite" : "";
      const hiddenClass = isHidden ? " is-hidden" : "";
      const favoriteIcon = isFavorite ? "fa-solid" : "fa-regular";
      const hiddenIcon = isHidden ? "fa-eye-slash" : "fa-eye";

      $(".container-grid").append(
        $(
         '<div class="card' + favoriteClass + hiddenClass + '" id="' +
            audio.attr("id") +
            '" data-favorite="' + isFavorite + '" data-hidden="' + isHidden + '">' +
              '<div class="top-bar">'  +
                '<div class="progress"></div>' +
              '</div>' +
              '<div class="middle-bar">' +
                '<div class="sound-image">' +
                  '<img src="/uploads/images/' +
                    audio.attr("soundImage") +
                '"></div>' +
                '<div class="sound-title">' +
                  audio.attr("title") +
                '</div>' +
                '</div>' +
                '<div class="sound-timer">' +
                  audio.attr("sound_length") +
                  '</div>' +
                  '<div class="duration-counter"></div>' +
                  '<div class="sound-count">#: '
                    +
                  audio.attr("play_count") +
                  '</div>' +

                '<div class="sound-actions">' +
                  '<div class="sound-favorite" data-sound-id="' + audio.attr("id") + '">' +
                    '<i class="' + favoriteIcon + ' fa-star"></i>' +
                  '</div>' +
                  '<div class="sound-hide" data-sound-id="' + audio.attr("id") + '">' +
                    '<i class="fa-regular ' + hiddenIcon + '"></i>' +
                  '</div>' +
                  '<div class="sound-share">' +
                    '<i class="fa-regular fa-share-from-square"></i>' +
                  '</div>' +
                '</div>' +
              '<div class="bottom-bar">' +
                '<div class="sound-tags">' +
                  audio.attr("search_tags") +
                '</div>' +
              '</div>' +
          '</div>' +
          
        '</div>' 

        ).click(function () {
          //console.log("test")
          //var dataUpdate = audio.attr("id");
          if (that.paused == false) {
            var duration = that.duration;
            that.pause();
            that.currentTime = 0;
            linksAan(this.id);
            //alert('music paused');
          } else {
            that.play();
            //alert('music playing');
            var duration = that.duration;
            //console.log(duration);
            var music = that;
            $(".oog-links").animate({right: '+=4px'});
            $(".oog-rechts").animate({right: '+=6px'});
            music.addEventListener("timeupdate", timeUpdate, false);
            function timeUpdate() {
              var playPercent = Math.round(100 * (that.currentTime / duration));
              //console.log(playPercent + "%");
              $(".card#" + this.id + " .progress").css(
                /* "opacity",
                "0.0" + playPercent */
                "left",
                -350 + playPercent * 3.5
              );
              $(".card#" + this.id + " .sound-timer").css(
                "visibility",
                "hidden"
              );
              $(".card#" + this.id + " .duration-counter")
                .css("visibility", "visible")
                .text(
                  format(duration - (duration / 100) * playPercent)
                  //format((duration / 100) * playPercent)
                );
                
            }

          }
        })
      ); 
    });

  function format(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }

  // ========================================
  // Sort Sounds - Favorites First
  // ========================================
  function sortSoundsByFavorites() {
    const container = $(".container-grid");
    const cards = container.children(".card").get();

    // Sort: favorites first, then by existing order
    cards.sort(function(a, b) {
      const aFav = $(a).attr("data-favorite") === "true";
      const bFav = $(b).attr("data-favorite") === "true";

      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // Keep original order for non-favorites
    });

    // Re-append in sorted order
    $.each(cards, function(index, card) {
      container.append(card);
    });

    // Reinitialize Isotope if it's being used
    if (typeof container.data('isotope') !== 'undefined') {
      container.isotope('reloadItems').isotope();
    }
  }

  // Initial sort on page load
  sortSoundsByFavorites();

  // ========================================
  // Show/Hide Hidden Sounds
  // ========================================
  window.showHiddenSounds = false; // Global state

  function updateHiddenSoundsVisibility() {
    const hiddenCards = $(".card.is-hidden");

    if (window.showHiddenSounds) {
      // Show all hidden sounds with reduced opacity
      hiddenCards.fadeIn(300);
    } else {
      // Hide all hidden sounds
      hiddenCards.fadeOut(300);
    }
  }

  // Show Hidden Toggle Button
  $("#show-hidden-toggle").click(function() {
    window.showHiddenSounds = !window.showHiddenSounds;

    const icon = $(this).find("i");
    const text = $("#show-hidden-text");

    if (window.showHiddenSounds) {
      $(this).css("background", "#28a745"); // Green when showing hidden
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      text.text("Hiding Hidden");
    } else {
      $(this).css("background", "#6c757d"); // Gray when hiding hidden
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
      text.text("Show Hidden");
    }

    updateHiddenSoundsVisibility();
  });

  // Initial hide of hidden sounds on page load
  updateHiddenSoundsVisibility();

  // ========================================
  // Favorite Button Handler
  // ========================================
  $(".sound-favorite").click(function(e){
    e.stopPropagation(); // Prevent sound from playing

    const soundId = $(this).data("sound-id");
    const card = $("#" + soundId);
    const icon = $(this).find("i");

    // Toggle favorite
    const isFavorite = StorageHelper.toggleFavorite(soundId);

    // Update UI
    if (isFavorite) {
      card.addClass("is-favorite").attr("data-favorite", "true");
      icon.removeClass("fa-regular").addClass("fa-solid");
      $.post("/message", {
        "type": "success",
        "bericht": "⭐ Toegevoegd aan favorieten",
        "duration": 2000
      });
    } else {
      card.removeClass("is-favorite").attr("data-favorite", "false");
      icon.removeClass("fa-solid").addClass("fa-regular");
      $.post("/message", {
        "type": "info",
        "bericht": "Verwijderd van favorieten",
        "duration": 2000
      });
    }

    // Re-sort sounds to put favorites on top
    sortSoundsByFavorites();
  });

  // ========================================
  // Hide Button Handler
  // ========================================
  $(".sound-hide").click(function(e){
    e.stopPropagation(); // Prevent sound from playing

    const soundId = $(this).data("sound-id");
    const card = $("#" + soundId);
    const icon = $(this).find("i");

    // Toggle hidden
    const isHidden = StorageHelper.toggleHidden(soundId);

    // Update UI
    if (isHidden) {
      card.addClass("is-hidden").attr("data-hidden", "true");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
      $.post("/message", {
        "type": "info",
        "bericht": "👁️ Sound verborgen",
        "duration": 2000
      });

      // Hide the card if we're not showing hidden sounds
      if (!window.showHiddenSounds) {
        card.fadeOut(300);
      }
    } else {
      card.removeClass("is-hidden").attr("data-hidden", "false");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      $.post("/message", {
        "type": "success",
        "bericht": "👁️ Sound zichtbaar",
        "duration": 2000
      });
      card.fadeIn(300);
    }
  });

  // ========================================
  // Share Button Handler
  // ========================================
  $(".sound-share").click(function(e){
    e.stopPropagation(); // Prevent sound from playing

    // Get the card ID (parent of parent = .sound-actions, then parent = .card)
    var idnummer = $(this).closest(".card").attr("id");
    var linkto = "https://soundboard.pieuw.nl/" + idnummer;

    function copyToClipboard(e) {
      var $temp = $('<input class="hibbem">');
      $("body").append($temp);
      $($(".hibbem")).val(linkto).select();
      document.execCommand("copy");
      $(".hibbem").remove();
      $.post("/message", { "type": "info", "bericht": "Link is gekopieerd", "link": linkto, "duration": 3000 });
    }

    copyToClipboard(linkto);
  });


  $(".container-grid a").click(function (event) {
     event.preventDefault();
   });

  // ========================================
  // Discord Integration
  // ========================================

  let discordEnabled = false;

  // Check Discord status on page load
  function checkDiscordStatus() {
    $.get("/api/discord/status", function(data) {
      if (data.enabled && data.connected) {
        discordEnabled = data.playbackEnabled;
        updateDiscordButton();
        console.log("Discord bot status:", data);
      } else {
        // Hide Discord button if not available
        $(".discord-control").hide();
      }
    }).fail(function() {
      $(".discord-control").hide();
    });
  }

  // Update Discord button appearance
  function updateDiscordButton() {
    if (discordEnabled) {
      $("#discord-status-text").text("Discord: ON");
      $("#discord-toggle").css("background", "#3ba55d"); // Green when ON
    } else {
      $("#discord-status-text").text("Discord: OFF");
      $("#discord-toggle").css("background", "#5865F2"); // Discord blue when OFF
    }
  }

  // Toggle Discord playback
  $("#discord-toggle").click(function() {
    discordEnabled = !discordEnabled;

    $.post("/api/discord/toggle",
      { enabled: discordEnabled },
      function(data) {
        if (data.success) {
          discordEnabled = data.enabled;
          updateDiscordButton();

          // Show notification
          $.post("/message", {
            "type": "info",
            "bericht": discordEnabled ? "Discord playback ingeschakeld 🎵" : "Discord playback uitgeschakeld 🔇",
            "duration": 2000
          });
        }
      }
    ).fail(function() {
      console.error("Failed to toggle Discord");
      // Revert on failure
      discordEnabled = !discordEnabled;
      updateDiscordButton();
    });
  });

  // Initialize Discord status
  checkDiscordStatus();
});



