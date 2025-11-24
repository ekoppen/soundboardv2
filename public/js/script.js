// ========================================
// Toast Notification System
// ========================================
window.showToast = function(type, title, message, duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Icon based on type
  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-times-circle"></i>',
    info: '<i class="fas fa-info-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Add to container
  container.appendChild(toast);

  // Show animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ========================================
// Confirm Modal System
// ========================================
window.showConfirm = function(title, message, onConfirm, onCancel) {
  // Create modal HTML
  const modalHTML = `
    <div class="modal-overlay confirm-modal-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: all;
    ">
      <div class="confirm-modal" style="
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transform: scale(0.9);
        transition: transform 0.3s ease;
        pointer-events: all;
      ">
        <div class="confirm-header" style="
          margin-bottom: 16px;
        ">
          <h3 style="
            color: #fff;
            margin: 0;
            font-size: 20px;
            font-family: 'Mina', sans-serif;
          ">${title}</h3>
        </div>
        <div class="confirm-body" style="
          margin-bottom: 24px;
          color: #ccc;
          font-size: 15px;
          line-height: 1.5;
        ">
          ${message}
        </div>
        <div class="confirm-footer" style="
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        ">
          <button class="confirm-cancel-btn" style="
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
            font-family: 'Mina', sans-serif;
            font-size: 14px;
            transition: all 0.2s ease;
            pointer-events: all;
            position: relative;
            z-index: 10001;
          ">Annuleren</button>
          <button class="confirm-confirm-btn" style="
            padding: 10px 20px;
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
            font-family: 'Mina', sans-serif;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            pointer-events: all;
            position: relative;
            z-index: 10001;
          ">Verwijderen</button>
        </div>
      </div>
    </div>
  `;

  // Add to body
  const modalElement = $(modalHTML).appendTo('body');
  const overlay = modalElement[0];
  const modal = modalElement.find('.confirm-modal')[0];

  // Show animation
  setTimeout(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);

  // Handle confirm
  modalElement.find('.confirm-confirm-btn').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    if (onConfirm) onConfirm();
  });

  // Handle cancel
  modalElement.find('.confirm-cancel-btn').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    if (onCancel) onCancel();
  });

  // Prevent clicks on modal from propagating
  modalElement.find('.confirm-modal').on('click', function(e) {
    e.stopPropagation();
  });

  // Close on overlay click
  modalElement.on('click', function(e) {
    e.stopPropagation(); // Prevent any clicks from reaching elements below
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });

  function closeModal() {
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => modalElement.remove(), 300);
  }
};

// ========================================
// Welcome Modal System
// ========================================
window.showWelcomeModal = function() {
  const overlay = document.getElementById('welcome-modal-overlay');
  if (!overlay) return;

  // Check if modal has been shown before
  const hasSeenWelcome = localStorage.getItem('welcomeModalShown');

  if (!hasSeenWelcome) {
    // Show modal after a short delay for better UX
    setTimeout(() => {
      overlay.style.display = 'flex';
      setTimeout(() => {
        overlay.classList.add('show');
      }, 10);
    }, 500);
  }
};

window.closeWelcomeModal = function() {
  const overlay = document.getElementById('welcome-modal-overlay');
  if (!overlay) return;

  // Hide modal with animation
  overlay.classList.remove('show');

  // Remove from DOM after animation
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);

  // Save to localStorage that user has seen the modal
  localStorage.setItem('welcomeModalShown', 'true');
};

// ========================================
// Reset UI after sound playback ends
// ========================================
window.linksAan = function(soundId) {
  // Reset progress bar
  $(".card#" + soundId + " .progress").css("width", "0%");

  // Show sound timer, hide duration counter
  $(".card#" + soundId + " .sound-timer").css("visibility", "visible");
  $(".card#" + soundId + " .duration-counter").css("visibility", "hidden");

  // Reset cat eyes
  $(".oog-links").stop().css({right: '54px'});
  $(".oog-rechts").stop().css({right: '44px'});
};

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

            // Update play count and trigger Discord playback
            $.post("/update", { "id": this.id });

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
                "width",
                playPercent + "%"
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

    if (window.showHiddenSounds) {
      $(this).addClass("showing-hidden");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      $(this).attr("title", "Hide Hidden Sounds");
    } else {
      $(this).removeClass("showing-hidden");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
      $(this).attr("title", "Show Hidden Sounds");
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
      // showToast("success", "Favoriet", "Toegevoegd aan favorieten ⭐", 2000);
    } else {
      card.removeClass("is-favorite").attr("data-favorite", "false");
      icon.removeClass("fa-solid").addClass("fa-regular");
      // showToast("info", "Favoriet", "Verwijderd van favorieten", 2000);
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
      // showToast("info", "Verborgen", "Sound verborgen 👁️", 2000);

      // Hide the card if we're not showing hidden sounds with slide animation
      if (!window.showHiddenSounds) {
        // Add sliding-out class for animation
        card.addClass("sliding-out");

        // After animation completes, hide the card
        setTimeout(function() {
          card.hide();
          card.removeClass("sliding-out");
        }, 300);
      }
    } else {
      card.removeClass("is-hidden").attr("data-hidden", "false");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      // showToast("success", "Zichtbaar", "Sound zichtbaar 👁️", 2000);

      // Show with slide animation
      card.show();
      setTimeout(function() {
        card.addClass("sliding-in");
        setTimeout(function() {
          card.removeClass("sliding-in");
        }, 300);
      }, 10);
    }
  });

  // ========================================
  // Share Button Handler (Local Only - No Broadcast)
  // ========================================
  $(".sound-share").click(function(e){
    e.stopPropagation(); // Prevent sound from playing

    // Get the card ID
    const soundId = $(this).closest(".card").attr("id");
    const linkto = window.location.origin + "/" + soundId;

    // Modern clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(linkto)
        .then(() => {
          // showToast("success", "Gekopieerd", "Link naar clipboard gekopieerd 🔗", 3000);
        })
        .catch(() => {
          // Fallback to old method
          copyToClipboardFallback(linkto);
        });
    } else {
      copyToClipboardFallback(linkto);
    }

    function copyToClipboardFallback(text) {
      const $temp = $('<input>');
      $("body").append($temp);
      $temp.val(text).select();
      document.execCommand("copy");
      $temp.remove();
      // showToast("success", "Gekopieerd", "Link naar clipboard gekopieerd 🔗", 3000);
    }
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
      $("#discord-toggle").addClass("connected");
      $("#discord-toggle").attr("title", "Discord: ON - Click to disable");
    } else {
      $("#discord-toggle").removeClass("connected");
      $("#discord-toggle").attr("title", "Discord: OFF - Click to enable");
    }
  }

  // Discord password protection
  const DISCORD_PASSWORD_KEY = 'discord_access_granted';
  const DISCORD_PASSWORD = 'soundboard2025'; // Change this to your preferred password

  function checkDiscordAccess() {
    return localStorage.getItem(DISCORD_PASSWORD_KEY) === 'true';
  }

  function grantDiscordAccess() {
    localStorage.setItem(DISCORD_PASSWORD_KEY, 'true');
  }

  function promptDiscordPassword() {
    const password = prompt('Voer wachtwoord in voor Discord controle:');
    if (password === DISCORD_PASSWORD) {
      grantDiscordAccess();
      return true;
    } else if (password !== null) {
      showToast("error", "Toegang geweigerd", "Onjuist wachtwoord", 3000);
    }
    return false;
  }

  // Toggle Discord playback with password protection
  $("#discord-toggle").click(function() {
    // Check if user has access
    if (!checkDiscordAccess()) {
      if (!promptDiscordPassword()) {
        return; // Exit if password is incorrect or cancelled
      }
    }

    discordEnabled = !discordEnabled;

    $.post("/api/discord/toggle",
      { enabled: discordEnabled },
      function(data) {
        if (data.success) {
          discordEnabled = data.enabled;
          updateDiscordButton();

          // Show notification (local only)
          if (discordEnabled) {
            showToast("success", "Discord", "Playback ingeschakeld 🎵", 2000);
          } else {
            showToast("info", "Discord", "Playback uitgeschakeld 🔇", 2000);
          }
        }
      }
    ).fail(function(xhr) {
      console.error("Failed to toggle Discord:", xhr.responseJSON);
      // Revert on failure
      discordEnabled = !discordEnabled;
      updateDiscordButton();

      // Show error message
      if (xhr.responseJSON && xhr.responseJSON.error) {
        showToast("error", "Discord Error", xhr.responseJSON.error, 4000);
      } else {
        showToast("error", "Discord Error", "Discord bot niet beschikbaar. Check .env configuratie.", 4000);
      }
    });
  });

  // Initialize Discord status
  checkDiscordStatus();

  // ========================================
  // Drag & Drop Reordering
  // ========================================

  // Apply custom order from localStorage
  function applyCustomOrder() {
    const customOrder = StorageHelper.getCustomOrder();
    if (customOrder.length === 0) return; // No custom order saved

    const container = $(".container-grid");
    const cards = container.children(".card");

    // Create a map of cards by ID for quick lookup
    const cardMap = {};
    cards.each(function() {
      const id = $(this).attr("id");
      cardMap[id] = $(this);
    });

    // Re-append cards in custom order
    customOrder.forEach(function(id) {
      if (cardMap[id]) {
        container.append(cardMap[id]);
      }
    });

    // Append any cards not in custom order (newly added sounds)
    cards.each(function() {
      const id = $(this).attr("id");
      if (!customOrder.includes(id)) {
        container.append($(this));
      }
    });
  }

  // Save current order to localStorage
  function saveCustomOrder() {
    const order = [];
    $(".container-grid .card").each(function() {
      order.push($(this).attr("id"));
    });
    StorageHelper.saveCustomOrder(order);
    console.log("Custom order saved:", order.length, "sounds");
  }

  // Initialize Sortable.js - DISABLED for main grid
  // Cards can only be dragged TO groups, not reordered in main grid
  // Reordering only works within groups
  const container = document.querySelector(".container-grid");
  if (container) {
    // Sortable disabled - cards are only draggable to groups via HTML5 drag API
    console.log("✅ Card drag to groups enabled (main grid sorting disabled)");
  }

  // Custom order disabled - only group ordering is saved
  // Main grid always uses default Isotope sorting

  // ========================================
  // Welcome Modal Initialization
  // ========================================
  showWelcomeModal();

  // Close button event
  $("#welcome-modal-close").click(function() {
    closeWelcomeModal();
  });

  // Close on overlay click (outside modal)
  $("#welcome-modal-overlay").click(function(e) {
    if (e.target === this) {
      closeWelcomeModal();
    }
  });

  // ========================================
  // Sound Groups System
  // ========================================

  // Render all groups
  function renderGroups() {
    const groups = GroupsHelper.getGroups();
    const container = $("#groups-container");
    container.empty();

    // Always show section so button is visible
    $("#groups-section").show();

    // Update button state
    $("#add-group-btn").prop("disabled", groups.length >= GroupsHelper.MAX_GROUPS);

    // Show/hide container based on groups
    if (groups.length === 0) {
      $(".groups-container").hide();
      return;
    }

    $(".groups-container").show();

    groups.forEach(group => {
      const groupEl = createGroupElement(group);
      container.append(groupEl);
      initializeGroupDragDrop(group.id);
      renderWaveforms(group);
    });
  }

  // Render waveforms for all sounds in a group
  function renderWaveforms(group) {
    group.sounds.forEach(sound => {
      // Skip if no waveformData or if it's an empty array string "[]"
      if (!sound.waveformData || sound.waveformData === '[]' || sound.waveformData.length <= 2) {
        return;
      }

      const canvas = $(`.waveform-canvas[data-instance-id="${sound.instanceId}"]`)[0];
      if (!canvas) {
        console.error('Canvas not found for instance:', sound.instanceId);
        return;
      }

      try {
        const waveformData = JSON.parse(sound.waveformData);
        drawWaveformOnCanvas(canvas, waveformData);
      } catch (e) {
        console.error('Failed to parse waveform data:', e);
      }
    });
  }

  // Draw waveform on canvas
  function drawWaveformOnCanvas(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    ctx.fillStyle = 'rgba(153, 51, 51, 0.7)';
    data.forEach((value, index) => {
      const barHeight = value * (height * 0.8);
      const x = index * barWidth;
      const y = (height / 2) - (barHeight / 2);
      ctx.fillRect(x, y, Math.max(barWidth - 0.5, 1), barHeight);
    });
  }

  // Create group HTML element
  function createGroupElement(group) {
    const totalDuration = GroupsHelper.getGroupDuration(group.id);
    const formattedDuration = GroupsHelper.formatDuration(totalDuration);

    const groupHTML = `
      <div class="sound-group" data-group-id="${group.id}" id="progress-${group.id}">
        <div class="group-progress-fill"></div>
        <div class="group-header">
          <div class="group-actions">
            <button class="group-action-btn delete-group"
                    data-group-id="${group.id}"
                    title="Groep verwijderen">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="group-stats">
            <span>${group.sounds.length} sounds</span>
            <span>•</span>
            <span>${formattedDuration}</span>
          </div>
        </div>

        <div class="group-sounds" data-group-id="${group.id}">
          <div class="timeline-playhead" data-group-id="${group.id}">
            <div class="playhead-triangle-top"></div>
            <div class="playhead-line"></div>
            <div class="playhead-triangle-bottom"></div>
          </div>
          ${group.sounds.length === 0
            ? '<div class="group-empty-state">Sleep sounds hierheen om ze toe te voegen aan de groep 🎵</div>'
            : group.sounds.map(sound => createGroupSoundElement(sound)).join('')
          }
        </div>

        <div class="group-footer">
          <div class="group-controls">
            <button class="group-play-btn play-group"
                    data-group-id="${group.id}"
                    title="Groep afspelen">
              <i class="fas fa-play"></i>
            </button>
            <button class="group-reset-btn reset-group"
                    data-group-id="${group.id}"
                    title="Terug naar begin">
              <i class="fas fa-step-backward"></i>
            </button>
          </div>
          <div class="group-progress-info">
            <span class="current-sound-name"></span>
            <span class="group-progress-counter">
              <span class="current-index">0</span>/<span class="total-sounds">${group.sounds.length}</span>
            </span>
          </div>
          <label class="playback-mode-toggle" title="Overlappende sounds tegelijk afspelen">
            <input type="checkbox" class="playback-mode-checkbox" data-group-id="${group.id}" checked>
            <span class="playback-mode-label">
              <i class="fas fa-layer-group"></i> Parallel
            </span>
          </label>
        </div>
      </div>
    `;

    return $(groupHTML);
  }

  // Create group sound item HTML - Timeline version with waveform
  function createGroupSoundElement(sound) {
    const durationSeconds = GroupsHelper.parseDuration(sound.duration);
    const pixelsPerSecond = 50; // Scale: 50px = 1 second
    const width = durationSeconds * pixelsPerSecond;
    const left = sound.startTime * pixelsPerSecond;

    return `
      <div class="timeline-sound-item"
           data-instance-id="${sound.instanceId}"
           data-start-time="${sound.startTime}"
           data-duration="${durationSeconds}"
           style="left: ${left}px; width: ${width}px;">
        <canvas class="waveform-canvas"
                data-instance-id="${sound.instanceId}"
                width="${width * 2}"
                height="120"></canvas>
        <div class="sound-info-overlay">
          <div class="sound-title-overlay">${sound.title}</div>
          <div class="sound-duration-overlay">${sound.duration}</div>
        </div>
        <div class="sound-resize-handle-left"></div>
        <div class="sound-resize-handle-right"></div>
        <button class="sound-remove-btn" data-instance-id="${sound.instanceId}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }

  // Initialize drag and drop for a group
  function initializeGroupDragDrop(groupId) {
    const groupSoundsEl = $(`.group-sounds[data-group-id="${groupId}"]`)[0];

    if (!groupSoundsEl) return;

    // Make group droppable for cards from main grid
    groupSoundsEl.addEventListener('dragover', function(e) {
      e.preventDefault();
      $(this).addClass('drag-over');
    });

    groupSoundsEl.addEventListener('dragleave', function(e) {
      $(this).removeClass('drag-over');
    });

    groupSoundsEl.addEventListener('drop', function(e) {
      e.preventDefault();
      $(this).removeClass('drag-over');

      const soundId = e.dataTransfer.getData('soundId');
      if (!soundId) return;

      // Get sound data from card and audio element
      const card = $(`.card#${soundId}`);
      // Try different selectors to find the audio element
      let audio = $(`audio#${soundId}`);
      if (audio.length === 0) {
        audio = $(`audio[id="${soundId}"]`);
      }
      if (audio.length === 0) {
        audio = $('audio').filter(function() {
          return $(this).attr('id') === soundId;
        });
      }

      const waveformAttr = audio.attr('waveform_data');

      // Filter out empty arrays "[]" and undefined/null
      let waveformData = null;
      if (waveformAttr && waveformAttr !== '[]' && waveformAttr.length > 2) {
        waveformData = waveformAttr;
      }

      const soundData = {
        id: soundId,
        title: card.find('.sound-title').text().trim(),
        image: card.find('.sound-image img').attr('src').split('/').pop(),
        duration: card.find('.sound-timer').text().trim(),
        audioSrc: audio.find('source').attr('src') || $(`audio#${soundId} source`).attr('src'),
        waveformData: waveformData
      };

      // Add to group
      GroupsHelper.addSound(groupId, soundData);
      renderGroups();
      // showToast('success', 'Toegevoegd', `"${soundData.title}" toegevoegd aan groep`, 2000);
    });

    // Make timeline items horizontally draggable
    initializeTimelineDrag(groupId, groupSoundsEl);

    // Initialize click-to-seek on timeline
    initializeTimelineSeek(groupId, groupSoundsEl);
  }

  // Check for overlaps between sounds
  function checkOverlaps(groupId, draggedItem) {
    const group = GroupsHelper.getGroup(groupId);
    if (!group) return [];

    const draggedInstanceId = draggedItem.data('instance-id');
    const draggedSound = group.sounds.find(s => s.instanceId === draggedInstanceId);
    if (!draggedSound) return [];

    const draggedStart = parseFloat(draggedItem.css('left')) / 50;
    const draggedEnd = draggedStart + GroupsHelper.parseDuration(draggedSound.duration);

    const overlaps = [];

    group.sounds.forEach(sound => {
      if (sound.instanceId === draggedInstanceId) return;

      const soundStart = sound.startTime;
      const soundEnd = soundStart + GroupsHelper.parseDuration(sound.duration);

      // Check if ranges overlap
      if (draggedStart < soundEnd && draggedEnd > soundStart) {
        overlaps.push(sound.instanceId);
      }
    });

    return overlaps;
  }

  // Update visual feedback for overlapping sounds
  function updateOverlapFeedback(groupSoundsEl, overlappingIds, draggedItem) {
    // Remove all overlap classes first
    $(groupSoundsEl).find('.timeline-sound-item').removeClass('overlapping overlap-target');

    // Add overlap classes
    if (overlappingIds.length > 0) {
      draggedItem.addClass('overlapping');
      overlappingIds.forEach(id => {
        $(groupSoundsEl).find(`.timeline-sound-item[data-instance-id="${id}"]`).addClass('overlap-target');
      });
    }
  }

  // Initialize horizontal drag for timeline items (mouse + touch support)
  function initializeTimelineDrag(groupId, groupSoundsEl) {
    let draggedItem = null;
    let startX = 0;
    let startLeft = 0;
    let isDragging = false;
    const pixelsPerSecond = 50;
    const DRAG_THRESHOLD = 5;

    // Start drag - mouse
    $(groupSoundsEl).on('mousedown', '.timeline-sound-item', function(e) {
      // Don't start drag on remove button or resize handles
      if ($(e.target).closest('.sound-remove-btn, .sound-resize-handle-left, .sound-resize-handle-right').length > 0) {
        return;
      }

      draggedItem = $(this);
      startX = e.pageX;
      startLeft = parseInt(draggedItem.css('left')) || 0;
      isDragging = true;

      draggedItem.addClass('dragging-timeline');
      e.preventDefault();
    });

    // Prevent context menu on timeline items
    $(groupSoundsEl).on('contextmenu', '.timeline-sound-item', function(e) {
      e.preventDefault();
      return false;
    });

    // Start drag - touch
    $(groupSoundsEl).on('touchstart', '.timeline-sound-item', function(e) {
      // Don't start drag on remove button or resize handles
      if ($(e.target).closest('.sound-remove-btn, .sound-resize-handle-left, .sound-resize-handle-right').length > 0) {
        return;
      }

      draggedItem = $(this);
      startX = e.touches[0].pageX;
      startLeft = parseInt(draggedItem.css('left')) || 0;
      isDragging = false; // Wait for movement threshold

      // Prevent context menu
      e.preventDefault();
    });

    // Move - mouse
    $(document).on('mousemove.timeline-drag', function(e) {
      if (!draggedItem) return;

      const deltaX = e.pageX - startX;
      let newLeft = startLeft + deltaX;

      // Don't allow negative positioning
      if (newLeft < 0) newLeft = 0;

      draggedItem.css('left', newLeft + 'px');

      // Check for overlaps and update visual feedback
      const overlaps = checkOverlaps(groupId, draggedItem);
      updateOverlapFeedback(groupSoundsEl, overlaps, draggedItem);
    });

    // Move - touch
    $(document).on('touchmove.timeline-drag', function(e) {
      if (!draggedItem) return;

      const touch = e.touches[0];
      const deltaX = touch.pageX - startX;

      // Check if we've moved enough to start dragging
      if (!isDragging && Math.abs(deltaX) > DRAG_THRESHOLD) {
        isDragging = true;
        draggedItem.addClass('dragging-timeline');
      }

      if (isDragging) {
        e.preventDefault(); // Only prevent default once we're dragging

        let newLeft = startLeft + deltaX;

        // Don't allow negative positioning
        if (newLeft < 0) newLeft = 0;

        draggedItem.css('left', newLeft + 'px');

        // Check for overlaps and update visual feedback
        const overlaps = checkOverlaps(groupId, draggedItem);
        updateOverlapFeedback(groupSoundsEl, overlaps, draggedItem);
      }
    });

    // End drag - mouse
    $(document).on('mouseup.timeline-drag', function(e) {
      if (!draggedItem) return;

      draggedItem.removeClass('dragging-timeline');

      // Calculate new start time from position
      const newLeft = parseInt(draggedItem.css('left')) || 0;
      const newStartTime = newLeft / pixelsPerSecond;
      const instanceId = draggedItem.data('instance-id');

      // Check for final overlaps
      const overlaps = checkOverlaps(groupId, draggedItem);

      // Update in storage
      GroupsHelper.updateSoundPosition(groupId, instanceId, newStartTime);

      // Clear overlap feedback
      updateOverlapFeedback(groupSoundsEl, [], draggedItem);

      draggedItem = null;
    });

    // End drag - touch
    $(document).on('touchend.timeline-drag', function(e) {
      if (!draggedItem) return;

      draggedItem.removeClass('dragging-timeline');

      // Calculate new start time from position
      const newLeft = parseInt(draggedItem.css('left')) || 0;
      const newStartTime = newLeft / pixelsPerSecond;
      const instanceId = draggedItem.data('instance-id');

      // Check for final overlaps
      const overlaps = checkOverlaps(groupId, draggedItem);

      // Update in storage
      GroupsHelper.updateSoundPosition(groupId, instanceId, newStartTime);

      // Clear overlap feedback
      updateOverlapFeedback(groupSoundsEl, [], draggedItem);

      draggedItem = null;
    });
  }

  // Helper function to update playhead and triangles position
  function updatePlayheadPosition(groupSoundsEl, xPosition) {
    // Update unified playhead element (line + triangles move together)
    const playhead = $(groupSoundsEl).find('.timeline-playhead');
    playhead.css('left', xPosition + 'px');
  }

  // Initialize click-to-seek on timeline and draggable playhead
  function initializeTimelineSeek(groupId, groupSoundsEl) {
    const pixelsPerSecond = 50;
    let isDraggingPlayhead = false;
    let playheadDragStart = 0;

    // Click on timeline to seek
    $(groupSoundsEl).on('click', function(e) {
      // Don't seek if clicking on a sound item, empty state, or playhead
      if ($(e.target).closest('.timeline-sound-item, .group-empty-state, .timeline-playhead, .playhead-top, .playhead-bottom').length > 0) {
        return;
      }

      const containerOffset = $(this).offset().left;
      const clickX = e.pageX - containerOffset + $(this).scrollLeft();

      // Move playhead and triangles
      updatePlayheadPosition($(this), clickX);

      // Update pause position
      pausedPositions[groupId] = clickX / pixelsPerSecond;
    });

    // Drag playhead
    $(groupSoundsEl).on('mousedown', '.timeline-playhead', function(e) {
      isDraggingPlayhead = true;
      playheadDragStart = e.pageX;
      $(this).addClass('dragging');
      e.preventDefault();
      e.stopPropagation();
    });

    $(document).on('mousemove.playhead-drag', function(e) {
      if (!isDraggingPlayhead) return;

      const containerOffset = $(groupSoundsEl).offset().left;
      let newX = e.pageX - containerOffset + $(groupSoundsEl).scrollLeft();

      // Don't allow negative positioning
      if (newX < 0) newX = 0;

      updatePlayheadPosition(groupSoundsEl, newX);

      // Update pause position in real-time
      pausedPositions[groupId] = newX / pixelsPerSecond;
    });

    $(document).on('mouseup.playhead-drag', function(e) {
      if (!isDraggingPlayhead) return;

      isDraggingPlayhead = false;
      $(groupSoundsEl).find('.timeline-playhead').removeClass('dragging');
    });
  }

  // Make cards draggable to groups (mouse + touch support)
  function makeCardsDraggable() {
    let touchDraggedCard = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    const DRAG_THRESHOLD = 10; // pixels to move before considering it a drag

    $('.card').each(function() {
      const card = this;
      card.setAttribute('draggable', 'true');

      // Mouse drag events
      card.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('soundId', $(this).attr('id'));
        $(this).css('opacity', '0.5');
      });

      card.addEventListener('dragend', function(e) {
        $(this).css('opacity', '1');
      });

      // Disable context menu on long press
      card.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
      });

      // Touch drag events
      card.addEventListener('touchstart', function(e) {
        // Store initial touch position
        touchDraggedCard = $(this);
        touchStartX = e.touches[0].pageX;
        touchStartY = e.touches[0].pageY;
        isDragging = false;
        // Don't preventDefault yet - let normal scrolling work until we detect drag
      }, { passive: true });

      card.addEventListener('touchmove', function(e) {
        if (!touchDraggedCard) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.pageX - touchStartX);
        const deltaY = Math.abs(touch.pageY - touchStartY);

        // Check if we've moved enough to be considered dragging
        if (!isDragging && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
          isDragging = true;
          touchDraggedCard.css('opacity', '0.5');
          touchDraggedCard.addClass('touch-dragging');
        }

        if (isDragging) {
          // Prevent scrolling while dragging
          e.preventDefault();

          // Check if we're over a group drop zone
          const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

          // Remove all drag-over classes first
          $('.group-sounds').removeClass('drag-over');

          // Add drag-over to the group we're hovering over
          if (elementBelow) {
            const groupSounds = $(elementBelow).closest('.group-sounds');
            if (groupSounds.length > 0) {
              groupSounds.addClass('drag-over');
            }
          }
        }
      }, { passive: false });

      card.addEventListener('touchend', function(e) {
        if (!touchDraggedCard) return;

        if (isDragging) {
          const touch = e.changedTouches[0];
          const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

          console.log('Touch end - element below:', elementBelow);

          if (elementBelow) {
            const groupSounds = $(elementBelow).closest('.group-sounds');
            console.log('Group sounds found:', groupSounds.length, groupSounds.data('group-id'));

            if (groupSounds.length > 0) {
              // Dropped on a group - add the sound
              const groupId = groupSounds.data('group-id');
              const soundId = touchDraggedCard.attr('id');

              console.log('Adding sound:', soundId, 'to group:', groupId);

              // Get sound data - EXACT same as desktop drop handler
              const card = $(`.card#${soundId}`);
              let audio = $(`audio#${soundId}`);
              if (audio.length === 0) {
                audio = $(`audio[id="${soundId}"]`);
              }
              if (audio.length === 0) {
                audio = $('audio').filter(function() {
                  return $(this).attr('id') === soundId;
                });
              }

              console.log('Audio element found:', audio.length);

              const waveformAttr = audio.attr('waveform_data');
              let waveformData = null;
              if (waveformAttr && waveformAttr !== '[]' && waveformAttr.length > 2) {
                waveformData = waveformAttr;
              }

              const soundData = {
                id: soundId,
                title: card.find('.sound-title').text().trim(),
                image: card.find('.sound-image img').attr('src').split('/').pop(),
                duration: card.find('.sound-timer').text().trim(),
                audioSrc: audio.find('source').attr('src') || $(`audio#${soundId} source`).attr('src'),
                waveformData: waveformData
              };

              console.log('Sound data:', soundData);

              // Add to group
              GroupsHelper.addSound(groupId, soundData);
              renderGroups();
              console.log('Sound added and groups rendered');
              // No toast - same as desktop drop handler
            }
          }
        }

        // Cleanup
        touchDraggedCard.css('opacity', '1');
        touchDraggedCard.removeClass('touch-dragging');
        $('.group-sounds').removeClass('drag-over');
        touchDraggedCard = null;
        isDragging = false;
      }, { passive: false });

      card.addEventListener('touchcancel', function(e) {
        // Cleanup on cancel
        if (touchDraggedCard) {
          touchDraggedCard.css('opacity', '1');
          touchDraggedCard.removeClass('touch-dragging');
          $('.group-sounds').removeClass('drag-over');
          touchDraggedCard = null;
          isDragging = false;
        }
      });
    });
  }

  // Event: Add new group
  $("#add-group-btn").click(function() {
    const group = GroupsHelper.createGroup();
    if (group) {
      renderGroups();
      // showToast('success', 'Groep aangemaakt', `"${group.name}" is aangemaakt`, 2000);
    } else {
      // showToast('warning', 'Maximum bereikt', `Je kunt maximaal ${GroupsHelper.MAX_GROUPS} groepen maken`, 3000);
    }
  });

  // Event: Delete group
  $(document).on('click', '.delete-group', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const groupId = $(this).data('group-id');
    const group = GroupsHelper.getGroup(groupId);

    showConfirm(
      'Groep verwijderen',
      `Weet je zeker dat je "${group.name}" wilt verwijderen?`,
      function() {
        // On confirm
        GroupsHelper.deleteGroup(groupId);
        renderGroups();
        showToast('success', 'Verwijderd', 'Groep succesvol verwijderd', 2000);
      }
    );
  });

  // Event: Remove sound from group (timeline version)
  $(document).on('click', '.sound-remove-btn', function(e) {
    e.stopPropagation();
    const instanceId = $(this).data('instance-id');
    const groupEl = $(this).closest('.sound-group');
    const groupId = groupEl.data('group-id');

    GroupsHelper.removeSound(groupId, instanceId);
    renderGroups();
    // showToast('info', 'Verwijderd', 'Sound verwijderd uit groep', 1500);
  });

  // Track active playback per group
  const activePlayback = {};
  const pausedPositions = {}; // Track pause positions for resume

  // Event: Reset group to beginning
  $(document).on('click', '.reset-group', function() {
    const groupId = $(this).data('group-id');

    // Stop playback if playing
    if (activePlayback[groupId]) {
      stopPlayback(groupId);
      $(`.play-group[data-group-id="${groupId}"]`).find('i').removeClass('fa-pause').addClass('fa-play');
      delete activePlayback[groupId];
    }

    // Reset playhead to beginning
    const groupSoundsEl = $(`.group-sounds[data-group-id="${groupId}"]`);
    updatePlayheadPosition(groupSoundsEl, 0);

    // Clear pause position
    delete pausedPositions[groupId];

    // Reset progress bar
    const progressEl = $(`#progress-${groupId}`);
    progressEl.find('.group-progress-fill').css('width', '0%');
    progressEl.find('.current-sound-name').text('');
    progressEl.find('.current-index').text('0');
  });

  // Event: Play/Pause group
  $(document).on('click', '.play-group', function() {
    const groupId = $(this).data('group-id');
    const button = $(this);
    const icon = button.find('i');

    // Check if already playing
    if (activePlayback[groupId]) {
      // Pause - store current position
      const currentPlayhead = $(`.group-sounds[data-group-id="${groupId}"]`).find('.timeline-playhead');
      const pausedX = parseFloat(currentPlayhead.css('left')) || 0;
      pausedPositions[groupId] = pausedX / 50; // Convert pixels to seconds

      stopPlayback(groupId);
      icon.removeClass('fa-pause').addClass('fa-play');
      delete activePlayback[groupId];
    } else {
      // Play
      icon.removeClass('fa-play').addClass('fa-pause');
      const resumeFrom = pausedPositions[groupId] || 0;
      playGroup(groupId, resumeFrom);
    }
  });

  // Play group with timeline support (overlapping sounds)
  function playGroup(groupId, resumeFrom = 0) {
    const group = GroupsHelper.getGroup(groupId);
    if (!group || group.sounds.length === 0) {
      // showToast('warning', 'Lege groep', 'Voeg eerst sounds toe aan deze groep', 2000);
      return;
    }

    // Check if parallel mode is enabled
    const isParallelMode = $(`.playback-mode-checkbox[data-group-id="${groupId}"]`).is(':checked');

    const progressEl = $(`#progress-${groupId}`);
    const progressFill = progressEl.find('.group-progress-fill');
    const currentSoundName = progressEl.find('.current-sound-name');
    const currentIndex = progressEl.find('.current-index');
    const groupSoundsEl = $(`.group-sounds[data-group-id="${groupId}"]`);
    const playhead = groupSoundsEl.find('.timeline-playhead');

    // Calculate timeline end (last sound's end time)
    let timelineEnd = 0;
    group.sounds.forEach(sound => {
      const soundEnd = sound.startTime + GroupsHelper.parseDuration(sound.duration);
      if (soundEnd > timelineEnd) timelineEnd = soundEnd;
    });


    // Track which sounds are playing
    const playingSounds = new Set();
    let startTime = Date.now() - (resumeFrom * 1000); // Adjust start time for resume
    let animationFrame = null;

    // Set initial playhead position for resume
    if (resumeFrom > 0) {
      updatePlayheadPosition(groupSoundsEl, resumeFrom * 50);
    }

    function update() {
      const elapsed = (Date.now() - startTime) / 1000; // seconds

      // Get fresh group data (in case sounds were moved during playback)
      const currentGroup = GroupsHelper.getGroup(groupId);
      if (!currentGroup) {
        stopPlaybackInternal();
        return;
      }

      // Sort sounds by start time with fresh data
      const sortedSounds = [...currentGroup.sounds].sort((a, b) => a.startTime - b.startTime);

      // Recalculate timeline end
      let currentTimelineEnd = 0;
      currentGroup.sounds.forEach(sound => {
        const soundEnd = sound.startTime + GroupsHelper.parseDuration(sound.duration);
        if (soundEnd > currentTimelineEnd) currentTimelineEnd = soundEnd;
      });

      // Update playhead position
      const playheadX = elapsed * 50; // 50 pixels per second
      updatePlayheadPosition(groupSoundsEl, playheadX);

      // Update progress bar
      const progress = (elapsed / currentTimelineEnd) * 100;
      progressFill.css('width', Math.min(progress, 100) + '%');

      if (isParallelMode) {
        // Parallel mode: play overlapping sounds simultaneously
        sortedSounds.forEach(sound => {
          const soundEnd = sound.startTime + GroupsHelper.parseDuration(sound.duration);
          const shouldBePlaying = elapsed >= sound.startTime && elapsed < soundEnd;

          if (shouldBePlaying && !playingSounds.has(sound.instanceId)) {
            // Start playing this sound
            playSound(sound, elapsed - sound.startTime);
          }
        });
      } else {
        // Sequential mode: only play one sound at a time (no overlap)
        // Find the sound that should be playing at this time
        let currentSound = null;
        for (let i = 0; i < sortedSounds.length; i++) {
          const sound = sortedSounds[i];
          const soundEnd = sound.startTime + GroupsHelper.parseDuration(sound.duration);

          if (elapsed >= sound.startTime && elapsed < soundEnd) {
            currentSound = sound;
            break;
          }
        }

        // Stop all sounds except the current one
        playingSounds.forEach(instanceId => {
          if (!currentSound || instanceId !== currentSound.instanceId) {
            const sound = currentGroup.sounds.find(s => s.instanceId === instanceId);
            if (sound) {
              const audio = document.querySelector(`audio[id="${sound.soundId}"]`);
              if (audio) {
                audio.pause();
                audio.currentTime = 0;
              }
              playingSounds.delete(instanceId);
              $(`.timeline-sound-item[data-instance-id="${instanceId}"]`).removeClass('playing');
            }
          }
        });

        // Play the current sound if needed
        if (currentSound && !playingSounds.has(currentSound.instanceId)) {
          playSound(currentSound, elapsed - currentSound.startTime);
        }
      }

      // Check if playback is complete
      if (elapsed >= currentTimelineEnd) {
        // Playback complete - reset everything
        stopPlaybackInternal();

        // Reset playhead to beginning
        updatePlayheadPosition(groupSoundsEl, 0);

        // Clear pause position
        delete pausedPositions[groupId];

        return;
      }

      // Continue animation
      animationFrame = requestAnimationFrame(update);
    }

    function playSound(sound, offset = 0) {
      const audio = document.querySelector(`audio[id="${sound.soundId}"]`);
      if (!audio) {
        console.error('Audio not found:', sound.soundId);
        return;
      }

      // Reset and set current time if offset
      audio.currentTime = offset;
      audio.play();

      // Mark as playing
      playingSounds.add(sound.instanceId);
      $(`.timeline-sound-item[data-instance-id="${sound.instanceId}"]`).addClass('playing');

      // Update play count
      $.post("/update", { "id": sound.soundId });

      // Remove from playing set when done
      audio.onended = function() {
        playingSounds.delete(sound.instanceId);
        $(`.timeline-sound-item[data-instance-id="${sound.instanceId}"]`).removeClass('playing');
      };
    }

    function stopPlaybackInternal() {
      // Stop animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      // Get fresh group data
      const currentGroup = GroupsHelper.getGroup(groupId);

      // Stop all playing sounds
      playingSounds.forEach(instanceId => {
        if (currentGroup) {
          const sound = currentGroup.sounds.find(s => s.instanceId === instanceId);
          if (sound) {
            const audio = document.querySelector(`audio[id="${sound.soundId}"]`);
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
            }
          }
        }
      });

      // Clear visual states
      groupSoundsEl.find('.timeline-sound-item').removeClass('playing');
      playingSounds.clear();

      // Don't reset playhead position - keep it for resume
      // Reset UI (except playhead)
      progressFill.css('width', '0%');
      currentSoundName.text('');
      currentIndex.text('');

      // Reset button icon
      $(`.play-group[data-group-id="${groupId}"]`).find('i').removeClass('fa-pause').addClass('fa-play');
      delete activePlayback[groupId];
    }

    // Store references for external stop
    activePlayback[groupId] = {
      animationFrame,
      playingSounds,
      groupSoundsEl,
      progressFill,
      playhead,
      currentSoundName,
      currentIndex,
      group,
      stop: stopPlaybackInternal
    };

    // Start playback
    update();
  }

  // External stop function
  function stopPlayback(groupId) {
    if (activePlayback[groupId]) {
      activePlayback[groupId].stop();
    }
  }

  // Initialize groups on page load
  renderGroups();

  // Make cards draggable after grid is initialized
  setTimeout(function() {
    makeCardsDraggable();
  }, 500);

});



