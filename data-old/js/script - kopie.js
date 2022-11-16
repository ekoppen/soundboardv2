$(document).ready(function () {
    // Remove no-javascript class if js is enabled

    $("body.no-javascript").removeClass("no-javascript");

    $("audio")
        .removeAttr("controls")
        .each(function (i, audioElement) {
            var audio = $(this);
            var that = this;
            $("#doc").append(
                $(
                    '<li id="' +
                    audio.attr("id") +
                    '"><a class="' +
                    audio.attr("class") +
                    '" href="#" title="' +
                    audio.attr("title") +
                    '"><img src="img/' +
                    audio.attr("class") +
                    '.png"/><p>' +
                    audio.attr("title") +
                    "</p></a><div class='playCount'>#: " +
                    audio.attr("playcount") +
                    "</div></li>" +
                    audio.attr('onended', "linksAan(this.id)")
                ).click(function () {
                    var dataUpdate = audio.attr("id");
                    //console.log(dataUpdate);
                    //$.post("/update", { id: dataUpdate });
                    that.play();
                })
            );

        });

    $(".container a").click(function (event) {
        event.preventDefault();
    });

});