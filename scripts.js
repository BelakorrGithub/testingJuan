(function($){
  var Carousel = Backbone.View.extend({
    el: $(".slide-buttons-container"), 
    events: {
      'click div#arrow-left': "clickLeft",
      'click div#arrow-right': "clickRight"
    },
    initialize: function(){
        this.$slides = [];
        $("#arrow-left").prop( 'disabled', true );
        $("#arrow-right").prop( 'disabled', true );
        for (var i=1; i<=6; i++) { /****** Increase i to get as much slides as needed (Although only requested 3) APP FULL SCALABLE ******/
            $(".slide-container").append("<div class='slide' id='slide"+i+"'><div>Slide "+i+"</div></div>");
        }
        $("#slide1").css("transform", "translateX(0)");
        for (var i=1; i<=$(".slide").length; i++){
            this.$slides.push("#slide"+i+" div");
            $("#slide"+i+" div").css("background-image", "url('slide"+i+".jpg')");
            //if (i%2==0){
                //$("#slide"+i+" div").css("backgroundColor", "darkcyan");
            //}
            $("#slide"+(i+1)).css("transform", "translateX("+i+"00%)"); // Applying the transform styles dynamically to give CSS scalability
        }
        showData(); // Load data for the first slide on pageload
    },
    clickLeft: function(){
        $("#arrow-left").prop( 'disabled', true );
        $("#arrow-right").prop( 'disabled', true );
        $(".slide").css("transition", "all .3s");
        if (($("#slide1").css("transform").split(',')[4]) < 0 ){ // Move back only if it's not the first slide
            for (var i=1; i<=$(".slide").length; i++){
                var position = parseInt($("#slide"+i).css("transform").split(',')[4]);
                $("#slide"+i).css("transform", "translateX("+(position + $('#slide'+i).width())+"px)");
            }
            showData();
            globalPosition--;
        }
        else { 
            $("#arrow-left").prop( 'disabled', false );
            $("#arrow-right").prop( 'disabled', false );
            $(".slide").css("transition", "none");
        }
    },
    clickRight: function(){
        $("#arrow-right").prop( 'disabled', true );
        $("#arrow-left").prop( 'disabled', true );
        $(".slide").css("transition", "all .3s");
        if ((($("#slide"+($(".slide").length))).css("transform").split(',')[4]) > 0 ){ // Move forward only if it's not the last slide
            for (var i=1; i<=$(".slide").length; i++){
                var position = parseInt($("#slide"+i).css("transform").split(',')[4]);
                $("#slide"+i).css("transform", "translateX("+(position - $("#slide"+i).width())+"px)");
            }
            showData();
            globalPosition++;
        }
        else {
            $("#arrow-left").prop( 'disabled', false );
            $("#arrow-right").prop( 'disabled', false );
            $(".slide").css("transition", "none");
        }
    }
  });
  var carousel = new Carousel();
})(jQuery);

var enabled = true; 
var globalPosition = 0;

function showData (){
    setTimeout(function(){ // Disable buttons until transalation effect has finished
        var pos;
        $("#arrow-left").prop( 'disabled', false );
        $("#arrow-right").prop( 'disabled', false );
        for (var i=1; i<=$(".slide").length; i++){
            if (parseInt($("#slide"+i).css("transform").split(',')[4]) == 0){
                pos = i;
            }
        }
        enabled = true;
        // $.ajax({ 
        //     type: "GET",
        //     dataType: "jsonp", // All info will be loaded from ID 1 until the desired ID
        //     /* url: Removed for security reasons*/
        //     success: function(data){
        //         var latestData = data[data.length-1]; // Getting latest object to get the most updated data available as an example
        //         // There's no way to get the names through the API so I inject the names through an array (So names won't show if you choose more than 10 slides)
        //         var locations = ["Tracer", "Mercy", "D.va", "Sennen", "Bastion", "Mei", "Croyde Beach", "Praa Sands", "Whitsand Bay", "Bantham"]; 
        //         var date = new Date(latestData.localTimestamp*1000);
        //         var hours = date.getHours();
        //         var minutes = "0" + date.getMinutes();
        //         //$("#slide"+pos+" div").html(locations[pos-1] + "  " + hours + ":" + minutes.substr(-2) + "<br>Swell: " + latestData.swell.minBreakingHeight + "ft<br>Wind: " + latestData.wind.speed + "mph");
        //         $("#slide"+pos+" div").html(locations[pos-1]);
        //         $(".slide").css("transition", "none");
        //         enabled = true;
        //     }
        // });
    }, 400);
}

function HammerCarousel(container) {
    this.container = container;

    this.panes = Array.prototype.slice.call(this.container.children, 0);
    this.containerSize = this.container['offsetWidth'];

    this.hammer = new Hammer.Manager(this.container);
    this.hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 }));
    this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this.onPan, this));

    this.show(globalPosition);
}

HammerCarousel.prototype = {
    show: function(showIndex, percent){
        percent = percent || 0;

        var className = this.container.className;

        var paneIndex, posi, translate;
        for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {
            posi = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);
            translate = 'translateX(' + posi + 'px)';
            this.panes[paneIndex].style.transform = translate;
        }
        globalPosition = showIndex;
    },

    onPan : function (ev) {
        if (enabled == true) {
            $(".slide").css("transition", "none"); // Remove transition so that dragging won't look messy just until panend or pancancel
            $("#arrow-left").prop( 'disabled', true );
            $("#arrow-right").prop( 'disabled', true );
            var percent = (100 / this.containerSize) * ev.deltaX;

            if (ev.type == 'panend' || ev.type == 'pancancel') { // If the mouse drag is finished or canceled
                enabled = false;
                /* This next line will check if the panend has been triggered, if it is not the first slide, and if it's not the last slide */
                if (Math.abs(percent) > 20 && ev.type == 'panend' && ($("#slide1").css("transform").split(',')[4]) < 0 && (($("#slide"+($(".slide").length))).css("transform").split(',')[4]) > 0) {
                    globalPosition += (percent < 0) ? 1 : -1;
                }
                $(".slide").css("transition", "all .3s");
                percent = 0;
                showData(); // Calling showData() function from here so that info will update as well when you use touch devices
            }
            this.show(globalPosition, percent);
        }
    }
};

var outer = new HammerCarousel(document.querySelector(".slide-container"));