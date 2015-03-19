	/*  
	Joe Rowley
    Scatter Plot Assignment
    */
    
    var csvDataSet = [];

    //import data
    d3.csv("scatterdata.csv",function(error, data){
    data.forEach(function(d) {
            d.country= d.country;
            d.gdp= +d.gdp;
            d.total= +d.total;
            d.pop = +d.population;
            d.epc= +d.epc; 
            csvDataSet.push(d);
        });
    renderEverything();
    //Call a render function once the data has been imported. 
    // Only can do some much async
    });

    
    //Define Margin
    var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
        width = 960 - margin.left -margin.right,
        height = 500 - margin.top - margin.bottom;

    //Define Color
    var colors = d3.scale.category20();

    //Define SVG
    var svg = d3.select("#chartBox")
        .append("svg")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id","chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class","innergraph") // setup an innergraph area, that will be subject to clipping on zooming
                                    // all dots, labels for dots, and the legend go in this group
    ;
    // Create the clip path
    // It should be offset such that it allows the y-axis to display
    d3.select("svg").append("defs").append("clipPath").attr("id", "cp")
        .append("rect")
        .attr("x", -80)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + ",0)")
    ;
    // Make it so that the inner graph items clip
    d3.select(".innergraph")
        .attr("clip-path", 'url(#cp)')
        .attr("transform", "translate(80,0)")
    ;
    
    function renderEverything(){

        //Define Scales   
            //Figure out max GDP
        var maxGDP = d3.max(csvDataSet, function(d) {return d.gdp; });
        var xScale = d3.scale.linear()
            .domain([0,maxGDP+2]) // Add 2 to space stuff out a bit. 
            .range([0, width]);   //
            //Figure out max EPC
        var maxEPC = d3.max(csvDataSet, function(d) {return d.epc; });
        var yScale = d3.scale.linear()
            .domain([-10,maxEPC+50]) //Need to redfine this after loading the data
            .range([height, 0]);

        //Define Axis
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickPadding(2);
        var yAxis = d3.svg.axis().scale(yScale).orient("left").tickPadding(2);
        
        // Tool Tip Code from: 
        // http://bl.ocks.org/d3noob/c37cb8e630aaef7df30d
        // http://bl.ocks.org/biovisualize/1016860
   
        // Define 'div' for tooltips
        var tooltip = d3.select("body")
            .append("div")                  // declare the tooltip div 
            .attr("class", "tooltip")       // apply the 'tooltip' class
            .style("opacity", 0)            // set the opacity to nil, so it is not visable
            .style("position", "absolute")  // 
            .style("z-index", "10");        // pull it to the top... Bit of a hack

        //Scale Changes as we Zoom
        // Call the function d3.behavior.zoom to Add zoom
        // Zoom Code from
        // http://bl.ocks.org/mbostock/3892919
        var zoom = d3.behavior.zoom()
            .x(xScale)
            .y(yScale)
            .scaleExtent([1, 5])
            .on("zoom", zoomed);

        function zoomed() {
            d3.select("#chart").select(".x.axis").call(xAxis);
            d3.select("#chart").select(".y.axis").call(yAxis);
            d3.select("#chart").selectAll(".dot").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            d3.select("#chart").selectAll(".country-label").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            d3.select("#chart").selectAll(".legend").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            
        }
        d3.select("#chart").call(zoom);

        // Draw Country Names
        // In innergraph 
        d3.select(".innergraph").selectAll(".text")
            .data(csvDataSet)
            .enter().append("text")
            .attr("class","text country-label")
            .style("text-anchor", "start")
            .attr("x", function(d) {return xScale(d.gdp);})
            .attr("y", function(d) {return yScale(d.epc);})
            .style("fill", "black")
            .text(function (d) {return d.country; });

        // Create x-axis
        // Not in innergraph 
        d3.select("#chart").append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(80," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("y", 50)
            .attr("x", width/2)
            .style("text-anchor", "end")
            .attr("font-size", "16px")
            .text("GDP (in Trillion US Dollars) in 2010");

        
        // Create Y-axis
        // Not in innergraph 
        d3.select("#chart").append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(80,0)")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("z-index", "10")
            .attr("font-size", "16px")
            .text("Energy Consumption per Capita (in Million BTUs per person)");


            //Draw Scatterplot in innergraph 
            svg.selectAll(".innergraph")
                .data(csvDataSet)           //assign data
                .enter().append("circle")   
                .attr("class", "dot")
                .attr("cx", function(d) {return xScale(d.gdp);})
                .attr("cy", function(d) {return yScale(d.epc);})
                .attr("r", function(d) { return Math.sqrt(d.total)/.2; })
                .style("fill", function (d) { return colors(d.country); })
                // add mouse over effect
                // http://bl.ocks.org/biovisualize/1016860
                .on("mouseover", function(d) {      
                    tooltip.transition()
                        .duration(300)  
                        .style("opacity", 0);
                    tooltip.transition()
                        .duration(200)  
                        .style("opacity", .9);  
                    tooltip .html( 
                        "<strong>" + d.country + "</Strong>" +"<br>" +
                        "Population: " + d.pop + " million <br>" +
                        "GDP: $" + d.gdp + " trillion <br>" +
                        "EPC: " + d.epc + " million BTUs <br>" +
                        "TEC: " + d.total + " Trillion BTUs"
                        )  
                        .style("left", (d3.event.pageX) + "px")          
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                // Learned This from:
                // http://bl.ocks.org/biovisualize/1016860
                .on("mousemove", function(){
                    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                })
                // Clear stuff once we mouse out.
                .on("mouseout", function(d) {      
                    tooltip.transition()
                        .duration(100)  
                        .style("opacity", 0);
                    tooltip.html("");
                    }
                )
            ;
        // add the Legend! 
        // draw legend colored rectangles
        d3.select(".innergraph").append("rect")
            .attr("class", "label legend")
            .attr("x", width-250)
            .attr("y", height-190)
            .attr("width", 220)
            .attr("height", 180)
            .attr("fill", "lightgrey")
            .style("stroke-size", "1px");

        d3.select(".innergraph").append("circle")
            .attr("class", "label legend")
            .attr("r", 5)
            .attr("cx", width-100)
            .attr("cy", height-175)
            .style("fill", "white");

        d3.select(".innergraph").append("circle")
            .attr("class", "label legend")
            .attr("r", 15.8)
            .attr("cx", width-100)
            .attr("cy", height-150)
            .style("fill", "white");

        d3.select(".innergraph").append("circle")
            .attr("class", "label legend")
            .attr("r", 50)
            .attr("cx", width-100)
            .attr("cy", height-80)
            .style("fill", "white");

        d3.select(".innergraph").append("text")
            .attr("class", "label legend")
            .attr("x", width -150)
            .attr("y", height-172)
            .style("text-anchor", "end")
            .text(" 1 Trillion BTUs");

        d3.select(".innergraph").append("text")
            .attr("class", "label legend")
            .attr("x", width -150)
            .attr("y", height-147)
            .style("text-anchor", "end")
            .text(" 10 Trillion BTUs");

        d3.select(".innergraph").append("text")
            .attr("class", "label legend")
            .attr("x", width -150)
            .attr("y", height-77)
            .style("text-anchor", "end")
            .text(" 100 Trillion BTUs");
        
        d3.select(".innergraph").append("text")
            .attr("class", "label legend")
            .attr("x", width -150)
            .attr("y", height-15)
            .style("text-anchor", "middle")
            .style("fill", "Green") 
            .attr("font-size", "20px")
            .text("Total Energy Consumption");  
}; //close our render everything function
