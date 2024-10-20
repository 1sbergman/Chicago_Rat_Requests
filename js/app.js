(function () {
    // application code goes here
    var map = L.map("map", {
        zoomSnap: 0.1,
        zoom: 11,
        center: [41.85, -87.6],
        zoomControl: false,
        minZoom: 9,
        maxZoom: 14,
        // maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83]),
    });


    // mapbox API access Token
    var accessToken =
        "pk.eyJ1IjoiMnNiZXJnbWFuIiwiYSI6ImNtMXliZ29jMDE2bzMyb29ydW9zeXk0MGUifQ.5Jg3kj2l0PkLzMb20hjwtQ";

    // request a mapbox raster tile layer and add to map
    L.geoJSON(communitiesjoined).addTo(map);

    L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`, {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: "light-v10",
            accessToken: accessToken,
        }
    ).addTo(map);
    

    
    drawMap(communitiesjoined);
    drawLegend(communitiesjoined);






    function drawMap(data) {
        const ratsLayer = L.geoJson(data, {
            style: function (feature) {
              return {
                color: "black",
                weight: 1,
                fillOpacity: 1,
                fillColor: "#1f78b4",
              };
            },
            pane: "choropleth",
          }).addTo(map);
        // create 2 separate layers from GeoJSON data
        

        // fit the bounds of the map to one of the layers
        map.fitBounds(ratsLayer.getBounds(), {
            padding: [50, 50],
            animate: false
        });
        // color the layers different colors
        
        colorize(ratsLayer, 1);
        sequenceUI(ratsLayer);
    } // end drawMap()
    
    function sequenceUI(ratsLayer) {
        // sequenceUI function body
        // create Leaflet control for the slider
        const sliderControl = L.control({
            position: "bottomleft",
        });

        sliderControl.onAdd = function (map) {
            const controls = L.DomUtil.get("slider");

            L.DomEvent.disableScrollPropagation(controls);
            L.DomEvent.disableClickPropagation(controls);

            return controls;
        };

        // add it to the map
        sliderControl.addTo(map);
        //select the slider's input and listen for change
        const slider = document.querySelector("#slider input");
        const Month = document.querySelector(".Month-slider");
        //select the slider's input and listen for change
        slider.addEventListener("input", function (e) {
            // current value of slider is current Month level
            var currentMonth = e.target.value;
            Month.innerHTML = currentMonth;
            // resize the circles with updated Month level
           colorize(ratsLayer, currentMonth);
            

            // update the output
            
            (".slider span").innerHTML = `${currentMonth})`;
        });
        
    }

    

    
    // create Leaflet control for the legend
    function drawLegend(breaks, colorize) {
        // create a Leaflet control for the legend
        const legendControl = L.control({
          position: "topright",
        });

        // when the control is added to the map
        legendControl.onAdd = function (map) {
          // create a new division element with class of 'legend' and return
          const legend = L.DomUtil.create("div", "legend");
          return legend;
        };

        // add the legend control to the map
        legendControl.addTo(map);

        // select the newly created legend, select and populate the heading,
        // creating an unordered list for the class ranges and store as reference
        // to variable
        const legend = document.querySelector(".legend");
        legend.innerHTML = "<h3><span>January</span> Rat Complaints</h3><ul>";

        // $('.legend').html("<h3><span>2006</span> Unemployment Rates</h3><ul>");

        // loop through the break values
        for (let i = 0; i < breaks.length - 1; i++) {
          // access the color for each class range
          const color = colorize(breaks[i]);

          // build a list item with color block and values
          const classRange = `<li><span style="background:${color}"></span>
                                ${breaks[i].toLocaleString()}% &mdash;
                                ${breaks[i + 1].toLocaleString()}%</li>`;

          // append to legend unordered list item
          legend.innerHTML += classRange;
        }
        // close legend unordered list
        legend.innerHTML += "</ul>";
      } // end drawLegend()

    // do the same thing for the UI slider
    const sliderControl = L.control({
        position: "bottomleft",
    });

    sliderControl.onAdd = function () {
        const controls = L.DomUtil.get("slider");

        L.DomEvent.disableScrollPropagation(controls);
        L.DomEvent.disableClickPropagation(controls);

        return controls;
    };

    sliderControl.addTo(map);

    window.addEventListener("resize", adjustHeight);
    const button = document.querySelector("#legend button")
    button.addEventListener('click', function () {
        const legend = document.querySelector(".leaflet-legend")
        legend.classList.toggle('show-legend')
    })

    function retreiveInfo(ratsLayer, currentMonth) {
        // select the element and reference with variable
        const info = document.querySelector("#info");

        // since ratsLayer is on top, use to detect mouseover events
        ratsLayer.on("mouseover", function (e) {
            // replace the the display property with block and show
            info.style.display = "block";

            // access properties of target layer
            const props = e.layer.feature.properties;

            // create a function with a short name to select elements
            const $ = function (x) {
                return document.querySelector(x);
            };

            // populate HTML elements with relevant info
            $("#info span").innerHTML = props.community;
            $(".rats span:first-child").innerHTML = `(Month ${currentMonth})`;
            
            $(".rats span:last-child").innerHTML = Number(
                props[`G${currentMonth}`]
            ).toLocaleString();
            

            // raise opacity level as visual affordance
            e.layer.setStyle({
                fillOpacity: 0.6,
            });
            // empty arrays for rats and rats values
            const ratsValues = []
            

            // loop through the Month levels and push values into those arrays
            for (let i = 1; i <= 9; i++) {
                console.log(typeof(props["Join_Count" + i])); // check the type of the value. returns string
                ratsValues.push(Number(props["Join_Count" + i]));
                
                }
            const ratsOptions = {
                id: "ratspark",
                width: 280, // No need for units; D3 will use pixels.
                height: 50,
                color: getColor("rats"),
                lineWidth: 3,
            };

          

            sparkLine(ratsValues, ratsOptions, currentMonth);
            
        });
        // hide the info panel when mousing off layergroup and remove affordance opacity
        ratsLayer.on("mouseout", function (e) {
            // hide the info panel
            info.style.display = "none";

            // reset the layer style
            e.layer.setStyle({
                fillOpacity: 0,
            });
        });
        // when the mouse moves on the document
        document.addEventListener("mousemove", function (e) {
            // If the page is on the small screen, calculate the position of the info window
            if (window.innerWidth < 768) {
                info.style.right = "10px";
                info.style.top = `${window.innerHeight * 0.25 + 5}px`;
            } else {
                // Console the page coordinates to understand positioning
                console.log(e.pageX, e.pageY);

                // offset info window position from the mouse position
                (info.style.left = `${e.pageX + 6}px`),
                (info.style.top = `${e.pageY - info.offsetHeight - 25}px`);

                // if it crashes into the right, flip it to the left
                if (e.pageX + info.offsetWidth > window.innerWidth) {
                    info.style.left = `${e.pageX - info.offsetWidth - 6}px`;
                }
                // if it crashes into the top, flip it lower right
                if (e.pageY - info.offsetHeight - 25 < 0) {
                    info.style.top = `${e.pageY + 6}px`;
                }
            }
        });

    }

    function adjustHeight() {
        const mapSize = document.querySelector("#map"),
            contentSize = document.querySelector("#content"),
            removeHeight = document.querySelector("#footer").offsetHeight,
            resize = window.innerHeight - removeHeight;

        if (window.innerWidth >= 768) {
            contentSize.style.height = `${resize}px`;
            mapSize.style.height = `${resize}px`;
        } else {
            contentSize.style.height = `${resize * 0.25}px`;
            mapSize.style.height = `${resize * 0.75}px`;
        }
    }

    function sparkLine(data, options, currentMonth) {
        d3.select(`#${options.id} svg`).remove();

        const w = options.width,
            h = options.height,
            m = {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5,
            },
            iw = w - m.left - m.right,
            ih = h - m.top - m.bottom,
            x = d3.scaleLinear().domain([0, data.length]).range([0, iw]),
            y = d3
            .scaleLinear()
            .domain([d3.min(data), d3.max(data)])
            .range([ih, 0]);

        const svg = d3
            .select(`#${options.id}`)
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", `translate(${m.left},${m.top})`);

        const line = d3
            .line()
            .x((d, i) => x(i))
            .y((d) => y(d));

        const area = d3
            .area()
            .x((d, i) => x(i))
            .y0(d3.min(data))
            .y1((d) => y(d));

        svg
            .append("path")
            .datum(data)
            .attr("stroke-width", 0)
            .attr("fill", options.color)
            .attr("opacity", 0.5)
            .attr("d", area);

        svg
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", options.color)
            .attr("stroke-width", options.lineWidth)
            .attr("d", line);

        svg
            .append("circle")
            .attr("cx", x(Number(currentMonth) - 1))
            .attr("cy", y(data[Number(currentMonth) - 1]))
            .attr("r", "4px")
            .attr("fill", "white")
            .attr("stroke", options.color)
            .attr("stroke-width", options.lineWidth / 2);
    }
})();

