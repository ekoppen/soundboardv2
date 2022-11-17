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
    
      $(".container-grid").append(
        $(
         '<div class="card" id="' +
            audio.attr("id") +
            '">' +
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
                
                '<div class="sound-share">' +
                  '<div id="share-link")><i class="fa-regular fa-share-from-square"></i></div>' +


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

  $(".sound-share").click(function(e){
    var idnummer = ($(this).parent()[0]).id;
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
    e.stopPropagation()
  
  });


  $(".container-grid a").click(function (event) {
     event.preventDefault();
   });
});



