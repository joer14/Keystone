	/*  
	Joe Rowley
    Keystone JS


    Arcs on outside of circle
    Chrods on inside of circle

    Arcs --> groups in D3 Lingo
    Arc length is determined by aggregating one complete row of the matrix

    Width of cord is determined by location in the matrix

    A lot of this code comes from Steven Hall
*/
      //*******************************************************************
      //  Create Matrix and Map
      //*******************************************************************
      var matrix;
      d3.csv('manyGroups.csv', function (error, data) {
        var mpr = chordMpr(data);
       // mpr.addToMap('conMem','count')
        mpr.
          addValuesToMap('conMem','conMem')
          .addValuesToMap('doner','doner')
          //.addValuesToMap('party', 'party')
          .setFilter(function (row, a, b) {
            return (row.doner === a.name && row.conMem === b.name ) ||
                   (row.doner === b.name && row.conMem === a.name );
          })
          .setAccessor(function (recs, a, b) {
            if (!recs[0]) return 0;
            // console.log(recs[0]);
            // console.log(recs.length);
            //return recs.length;
            //return +recs[0].count;
            return {party: recs[0].party, count: recs[0].count, valueOf: value}
          });
          function value() { return +this.count; }
          matrix = mpr.getMatrix();
         drawChords(mpr.getMatrix(), mpr.getMap());
      });
      
      var chordFill = d3.scale.ordinal()
          .domain(d3.range(5))
          .range(["#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0","#67a9cf"]);
              /*
#b2182b

#ef8a62
#fddbc7
#f7f7f7
#d1e5f0
#67a9cf

#2166ac
    */
      //*******************************************************************
      //  DRAW THE CHORD DIAGRAM
      //*******************************************************************
      
      function drawChords (matrix, mmap) {
        var w = 980, h = 800, r1 = h / 2, r0 = r1 - 100;

        var fill = d3.scale.ordinal()
            .range(['#c7b570','#c6cdc7','#335c64','#768935','#507282','#5c4a56','#aa7455','#574109','#837722','#73342d','#0a5564','#9c8f57','#7895a4','#4a5456','#b0a690','#0a3542',]);

        var chord = d3.layout.chord()
            .padding(.01)
            //.sortGroups()
            .sortSubgroups(d3.ascending)
            //.sortSubgroups(d3.ascending)
        
            .sortGroups(d3.descending);
        //chord.sortSubgroups(d3.descending);
        
        // console.log(chord.groups)
        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);

        var svg = d3.select("#chartBox").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
          .append("svg:g")
            .attr("id", "circle")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

            svg.append("circle")
                .attr("r", r0 + 20);

        var rdr = chordRdr(matrix, mmap);
        chord.matrix(matrix);
        //console.log(chord.matrix(matrix).groups);

        var g = svg.selectAll("g.group")
            .data(chord.groups())
          .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover)
            .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

        g.append("svg:path")
            .style("stroke", "black")
            .style("fill", function(d) { 
              //console.log(rdr(d));
              var fillColor; 
              //console.log(rdr(d).gname);
              if(rdr(d).gname=="Republican") return "#b2182b";
              else if (rdr(d).gname=="Democrat") return "#2166ac";

              return rdr(d).gdata == "conMem" ? "purple": "grey"; 
              //return "purple";
            })
            .attr("d", arc);

        g.append("svg:text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .style("font-family", "helvetica, arial, sans-serif")
            .style("font-size", "10px")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r0 + 26) + ")"
                  + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) { return rdr(d).gname; });

          
       // chord.sortSubGroups(d3.descending)
          var chordPaths = svg.selectAll("path.chord")
                .data(chord.chords())
              .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", "black")
                .style("fill", function(d) { 
                  var dd =rdr(d);
                  //var q = d3.round(num);
                  // Make a number between 0 and 4
                  if(dd.sname == "Democrat") {
                    var num = dd.tvalue/dd.ttotal;
                    var num2 = 4*num;
                    var num3 = d3.round(num2);
                   // console.log(dd.tname, num, num3);
                    //console.log()
                    
                    return chordFill(num3);
                  }

                  else if(dd.sname == "Republican") {
                    var num = dd.tvalue/dd.ttotal;
                    var num2 = 4*num;
                    var num3 = d3.round(num2);
                    //console.log(dd.tname, num, num3);
                    
                    // Reverse the number
                    return chordFill(4-num3);
                  }
                  else return "Green";
                  // return dd.tname == "Independent oil & gas producers" ? "#00592d": "#ff6200"; 
                })
                .attr("d", d3.svg.chord().radius(r0))
                .on("mouseover", function (d) {
                  d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
                    .style("top", function () { return (d3.event.pageY - 170)+"px"})
                    .style("left", function () { return (d3.event.pageX - 100)+"px";})
                })
                .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });  
          function chordTip (d) {
            var p = d3.format(".1%"), q = d3.format(",f")
             //console.log(d);
             //console.log(d.tname);
            var msg= "<strong>Contribution Info:</strong><br/>"
              

              
              + d.tname + " to " + d.sname +"s"
              + ": $" + q(d.tvalue) + "<br/>"
              + p(d.tvalue/d.ttotal) + " of " + d.tname + "'s Total ($" + q(d.ttotal) + ")<br/>"
              + p(d.tvalue/(d.mtotal/2)) + " of Total Donated($" + q(d.mtotal/2) + ")";
            return msg;
          }

          function groupTip (d) {
            // console.log( d);
            var p = d3.format(".1%"), q = d3.format(",f")
            // return "Group Info:<br/>"
            //     + d.gdata
            //     + "<br/>"
            //     + d.gname + " : " + q(d.gvalue) + "<br/>"
            //     + p(d.gvalue/(d.mtotal/2)) + " of Matrix Total (" + q(d.mtotal/2) + ")"
           return  d.gname + "s: $" + q(d.gvalue) + "<br/>"
                + p(d.gvalue/(d.mtotal/2)) + " of Total ($" + q(d.mtotal/2) + ")"
          
          }

          function mouseover(d, i) {
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))
              .style("top", function () { return (d3.event.pageY - 80)+"px"})
              .style("left", function () { return (d3.event.pageX - 130)+"px";})

            chordPaths.classed("fade", function(p) {
              return p.source.index != i
                  && p.target.index != i;
            });
          }
      }
