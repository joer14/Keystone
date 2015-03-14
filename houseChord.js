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
      d3.csv('fewGroups.csv', function (error, data) {
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
            return { count: recs[0].count, valueOf: value}
          });
          function value() { return +this.count; }
          matrix = mpr.getMatrix();
         drawChords(mpr.getMatrix(), mpr.getMap());
      });
      
      var chordFill = d3.scale.ordinal()
          .domain(d3.range(5))
          .range(["#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0","#67a9cf"]);

      var repubColor = "#b2182b";
      var demoColor = "#2166ac";
      var groupColor = "#a1d99b"
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
        var w = 700, h = 600, r1 = w / 2, r0 = r1 - 100;

        var fill = d3.scale.ordinal()
            .range(['#c7b570','#c6cdc7','#335c64','#768935','#507282','#5c4a56','#aa7455','#574109','#837722','#73342d','#0a5564','#9c8f57','#7895a4','#4a5456','#b0a690','#0a3542',]);
//console.log(d3.ascending);
        var chord = d3.layout.chord()
            .padding(.01)
            //.sortGroups()
            //.sortSubgroups(d3.ascending)

            .sortGroups(
              /*
                democrats = 26754682
                repubs = 58424112

                function d3_ascending(a, b) {
                return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
              }

              */
              //console.log(d3.ascending);/
              //d3.ascending
              function(a,b){ 
                //console.log("A: ", a, "B: ", b);
                //if(a==1558488)return 2;
                //else 
                
                //console.log(d3.ascending);
                //console.log("B: ", b);
                // A hack so that democrats and republicans
                // are right next to each other because
                // as it turns out, fossil fuel energy industry
                // gives more money than democrats recieve.
                var fossVal = 26928999;
                var demoVal = 26754682;
                var repubVal = 58424112;

                //console.log(a,b);
                if((a == fossVal)&&(b == demoVal)) return -1;
                if((b == demoVal)&&(a == repubVal)) return -1;
                
                if(a<b) {
                  return -1;
                }else if (a>b) {
                  return 1;
                }else if(a>=0) {
                  return 0;
                }else {
                  return NaN;
                }
               
            }
            )
            
        chord.sortSubgroups(
          d3.ascending
          
            );
        
        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);

        var svg = d3.select("#chartBox").append("svg:svg")
            .attr("width", w)
            .attr("height", h+50)
            .attr("id","chordDiagram")
          .append("svg:g")
            .attr("id", "circle")
            .attr("transform", function(){
              var trans= "translate(" + w / 2 + "," + h / 2 + ")";
              var trans2 = "scale(-1,-1)";
              var trans3= trans + trans2;
              return trans3;
            })
            
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
            .on("mouseout", mouseout);

        g.append("svg:path")
            .style("stroke", "black")
            .style("fill", function(d) { 
              //console.log(rdr(d));
              var fillColor; 
              //console.log(rdr(d).gname);
              if(rdr(d).gname=="Republican") return repubColor;
              else if (rdr(d).gname=="Democrat") return demoColor;

              return rdr(d).gdata == "conMem" ? "purple": groupColor; 
              //return "purple";
            })
            .attr("d", arc);

        g.append("svg:text")
            .each(function(d) { 
              d.angle = (d.startAngle + d.endAngle) / 2; 
              //d.party = "joe";
              })
              .attr("dy", ".35em")
              .style("font-family", "helvetica, arial, sans-serif")
              .style("font-size", "12px")
              .attr("id", function(d){
                return "text"+d.index;
              })
              .attr("text-anchor", function(d) { 
                return d.angle < Math.PI ? "end" : null;
              })
              // Space out all the text
              .attr("transform", function(d) {
                  var trans =  "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                     + "translate(" + (r0 + 26) + ")"  // pushes it out to a certain radius
                     + (d.angle > Math.PI ? "rotate(180)" : "");
                  
                  var yUp = 280;
                  
                  //if(d.angle<.12) yUp = 280 + (d.value/89000 )*3;
                  /*
                  89000
                  435900
                  595292
                  1518891
                  */
                  var xTrans = Math.sin(d.angle)*280;
                  
                  if(d.value<89052) yUp += 20;
                  else if(d.value<435905) yUp += 20;
                  else if(d.value<595293) yUp += 20;
                  else if(d.value<1518892) yUp += 20;
                  else if(d.value<1558488) {
                    yUp += 20;
                    xTrans += -20;
                  }
                  var yTrans = -Math.cos(d.angle)*yUp;
                  //console

                  var trans2 = "translate("+xTrans+","+ yTrans+")"
                  
                  var trans3 = " scale(-1, -1)";

                  var allTrans = trans2 + trans3;
                  return allTrans;
                    //  return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    // + "translate(" + (r0 + 26) + ")"
                    // + (d.angle > Math.PI ? "rotate(180)" : "");
              })
              .style("visibility",function(d){
                if(d.value<1558488) return "hidden";
                else return ""
              })
              
              .text(function(d) { 
                if(rdr(d).gname.indexOf("&") > -1) {
                  return "Materials"

                }
                
                return rdr(d).gname; 
              });

          // add legend   
          var legend = d3.select("#chordDiagram").append("g")
            .attr("class", "legend")
            .attr("x", w - 65)
            .attr("y", 50)
            .attr("height", 100)
            .attr("width", 100)

            //.attr('transform', 'translate(-20,50)')    
              
            
            legend.selectAll('rect')
              .data(chordFill.domain().slice().reverse())
              .enter()
              .append("rect")
              .attr("y", h - 30)
              .attr("x", function(d, i){ 
                return (i *  40);
              })
              .attr("width", 20)
              .attr("height", 20)
              .style("fill", function(d) { 
                  //var color = color_hash[dataset.indexOf(d)][1];
                  //return color;
                  return chordFill(d);
                })
              
            legend.selectAll('text')
              .data(chordFill.domain().slice().reverse())
              .enter()
              .append("text")
              .attr("y", h +10)
              .attr("x", function(d, i){ 
                return i *  40;
              })
              .style("font-size", "12px")
            .text(function(d) {
                //var text = color_hash[dataset.indexOf(d)][0];
                //return text;
                switch(d){
                  case 4: return ">80%";
                  case 3: return ">60%";
                  case 2: return ">40%";
                  case 1: return ">20%";
                  case 0: return ">=0%";
                }

                return d;
              });
         
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
                    var p = d3.format(".1%"), q = d3.format("$3,.2s")
                     //console.log(d);
                     //console.log(d.tname);
                    var msg= "<strong>Contribution Info:</strong><br/>"
                      

                      
                      + d.tname + " to " + d.sname +"s"
                      + ": " + q(d.tvalue) + "<br/>";
                      // + p(d.tvalue/d.ttotal) + " of " + d.tname + "'s Total (" + q(d.ttotal) + ")<br/>"
                      // + p(d.tvalue/(d.mtotal/2)) + " of Total Donated($" + q(d.mtotal/2) + ")";
                    return msg;
                  }


          function groupTip (d) {
            // console.log( d);
            var p = d3.format(".1%"), q = d3.format("$3,.2s")
            // return "Group Info:<br/>"
            //     + d.gdata
            //     + "<br/>"
            //     + d.gname + " : " + q(d.gvalue) + "<br/>"
            //     + p(d.gvalue/(d.mtotal/2)) + " of Matrix Total (" + q(d.mtotal/2) + ")"
           return  d.gname + ": " + q(d.gvalue) + "<br/>"
                + p(d.gvalue/(d.mtotal/2)) + " of Total (" + q(d.mtotal/2) + ")"
          
          }

          function fillInfoBox (d) {
            var generalCongressInfo ="<h3>House of Representatives Make Up</h3>"
            // console.log( d);
            

            var p = d3.format(".1%"), q = d3.format("$3,.2s")
            
            // Fill in all the sub groups and how much they donated here
            // Maybe fill in special text for each one too.. idk. 
            var subGroups = { 
                            
                            "Fossil Fuels": { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Construction":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Unions ":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} ,
                            "Ideological Groups":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Transportation":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Environmental policy":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Business Associations":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Alternate energy production & services":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Nuclear energy":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Other":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"} },
                            "Materials & Manufacturing":  { "Coal mining": {"Republicans":"1,797,895.00","Democrats":"31000.00"} , "SUA":{"Democrats":"$10","Republicans":"$15"}

                            }}};
            //_each
            var rows = ""; 
            
            var aGroup= subGroups[d.gname];
            _.forEach(aGroup, function(n, key) {
                var demStr = n.Democrats;
                demStr = parseInt(demStr.replace(/,/g, ""));
                demStr = q(demStr);
                //console.log(n.Democrats)
                //console.log(q(parseInt(n.Democrats)))
                var repStr = n.Republicans;
                repStr = parseInt(repStr.replace(/,/g, ""));
                repStr = q(repStr);
                rows += "<tr><td>"+ key +"</td><td>" + demStr +  "</td><td>" +  repStr+ "</td></tr>";
            });
            var header = "<strong>" +d.gname + ":</strong> <br>";
            var strGroups = "Subgroups: <table> <tr> <th>Group</th><th>Democrats</th><th>Republicans</th>" + rows + "</table>";

            var strTotalDonate = "Contributed: " + q(d.gvalue) + " (" + p(d.gvalue/(d.mtotal/2)) +" of total donations) <br>";
            var msg = header + strTotalDonate + strGroups ;
            return msg;
          
          }

          function mouseover(d, i) {
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))
              .style("top", function () { return (d3.event.pageY - 80)+"px"})
              .style("left", function () { return (d3.event.pageX - 130)+"px";})

            
             
            d3.select("#infoBox")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))

            d3.select("#infoBox")
              .style("visibility", "visible")
              .html(fillInfoBox(rdr(d)))


            var textStringID = "#text"+i;      
            d3.select(textStringID)
              .style("visibility", "visible")

            chordPaths.classed("fade", function(p) {
              return p.source.index != i
                  && p.target.index != i;
            });
          }
          function mouseout(d, i) {
            
            d3.select("#tooltip").style("visibility", "hidden") 
            //Only remove text labels for small tight groups
            if(d.value<1558488) {
              var textStringID = "#text"+i;      
              d3.select(textStringID)
                .style("visibility", "hidden")
            }
          }


          
      }

