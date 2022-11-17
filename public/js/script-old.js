$(document).ready(function () {
  $("body.no-javascript").removeClass("no-javascript");
  function dateFormatter(value) {
    jQuery.format.prettyDate(value);
  }

  $("audio")
    .removeAttr("controls")
    .each(function (i, audioElement) {
      var audio = $(this);
      var that = this;

      $(".container").append(
        $(
          '<div class="wrapper">' +

          '<div class="sound-wrapper" id="' +
            audio.attr("id") +
            '<div class="sound-counter">#: ' +
            '">' +
            '<div class="rating"></div>' +
            '<div class="progress-bar"></div>' +
            audio.attr("sound_length") +
            "</div>" +
            '<div class="duration"></div>' +
            '<div class="duration-counter"></div>' +
            '<div class="bottom-bar"></div>' +
            '<div><h2><a id="share-link" href="#" onClick=console.log("' + 
            this.id +
            '")>share</a></h2></div>' +

            audio.attr("playcount") +
            "</div>" +
            '<div class="sound-groep">' +
            audio.attr("class") +
            "</div>" +
            '<div class="search-tags">' +
            audio.attr("search_tags") +
            "</div>" +
            '<div class="date-created">' +
            audio.attr("date_created") +
            "</div>" +
            '<a class="' +
            audio.attr("class") +
            '" href="#" title="' +
            audio.attr("title") +
            '"><div class="sound-image">' +
            '<img src="/uploads/images/' +
            audio.attr("soundImage") +
            '"/></div>' +
            '<div class="sound-title"><span>' +
            audio.attr("title") +
            '"</span></div>' +
            '"</a>' +
            audio.attr("onended", "linksAan(this.id)") +
            '</div>'

        ).click(function () {
          var dataUpdate = audio.attr("id");
          //console.log(dataUpdate);
          //$.post("/update", { id: dataUpdate });
          //that.play();
          //console.log(that);
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
            var music = that;
            music.addEventListener("timeupdate", timeUpdate, false);
            function timeUpdate() {
              var playPercent = Math.round(100 * (that.currentTime / duration));
              //console.log(playPercent + "%");
              $(".sound-wrapper#" + this.id + " .progress-bar").css(
                /* "opacity",
                "0.0" + playPercent */
                "left",
                -350 + playPercent * 3.5
              );
              $(".sound-wrapper#" + this.id + " .duration").css(
                "visibility",
                "hidden"
              );
              $(".sound-wrapper#" + this.id + " .duration-counter")
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


  $(".container a").click(function (event) {
     event.preventDefault();
   });
});


