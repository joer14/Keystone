	/*  

  Todo
    
    Part 1 todo: 

      3rd color intreset groups
      put democratrs on top of republicans in both the chord diagram and bar chart
      fix tool tip -
        make background lighter/clearer 
        change language so it's just the name and the percent
      add border to subgroup box
      remove black line from bar chart and change order
      align money to the right... make it $20k instead of $20,00
      
      input all of subgroups from the excel sheet

    Pac/Non Pac Switch View
    

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
      //var matrix;
      d3.csv('yesNoMany.csv', function (error, data) {
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
         drawChords2(mpr.getMatrix(), mpr.getMap());
      });
      
      var chordFill2 = d3.scale.ordinal()
          .domain(d3.range(5))
          .range(["#e9a3c9", "#fde0ef", "#f7f7f7", "#e6f5d0","#a1d76a"]);
              /*
#c51b7d

#e9a3c9
#fde0ef
#f7f7f7
#e6f5d0
#a1d76a

#4d9221
    */
      //*******************************************************************
      //  DRAW THE CHORD DIAGRAM
      //*******************************************************************
      
      function drawChords2 (matrix, mmap) {
        var w = 700, h = 700, r1 = h / 2, r0 = r1 - 100;

        var fill = d3.scale.ordinal()
            .range(['#c7b570','#c6cdc7','#335c64','#768935','#507282','#5c4a56','#aa7455','#574109','#837722','#73342d','#0a5564','#9c8f57','#7895a4','#4a5456','#b0a690','#0a3542',]);
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
                //  console.log(-1);
                  return -1;
                }else if (a>b) {
                //  console.log(1);
                  return 1;
                }else if(a>=0) {
                //  console.log(0);
                  return 0;
                }else {
                //  console.log(NaN);
                  return NaN;
                }
                //return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
                //console.log(d3.ascending);  
            }
            )
            //.sortSubgroups(function(a,b) { return 1; })
            //.sortChords(d3.ascending)
            //.sortGroups(d3.descending);
        chord.sortSubgroups(
          d3.descending
          // function(a,b){ 
          //       //console.log("A: ", a, "B: ", b);
          //       //if(a==1558488)return 2;
          //       //else 
                
          //       //console.log(d3.ascending);
          //       //console.log("B: ", b);
          //       // A hack so that democrats and republicans
          //       // are right next to each other because
          //       // as it turns out, fossil fuel energy industry
          //       // gives more money than democrats recieve.
                
          //       console.log(a,b);
          //       //return d3.ascneding
          //       //return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
          //       //console.log(d3.ascending);  
          //   }
            );
        
        // console.log(chord.groups)
        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 20);

        var svg = d3.select("#chartBox2").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id","chordDiagram2")
          .append("svg:g")
            .attr("id", "circle2")
            .attr("transform", function(){
              var trans= "translate(" + w / 2 + "," + h / 2 + ")";
              var trans2 = "scale(-1,-1)";
              var trans3= trans + trans2;
              return trans3;
            })
            
            svg.append("circle2")
                .attr("r", r0 + 20);

        var rdr = chordRdr(matrix, mmap);
        chord.matrix(matrix);
        //console.log(chord.matrix(matrix).groups);

        var g = svg.selectAll("g.group")
            .data(chord.groups())
          .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover2)
            .on("mouseout", mouseout2);

        g.append("svg:path")
            .style("stroke", "black")
            .style("fill", function(d) { 
              //console.log(rdr(d));
              var fillColor; 
              //console.log(rdr(d).gname);
              if(rdr(d).gname=="Yes") return "#c51b7d";
              else if (rdr(d).gname=="No") return "#4d9221";

              return rdr(d).gdata == "conMem" ? "#f7f7f7": "grey"; 
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
                  if(d.value<89052) yUp += 0;
                  else if(d.value<435905) yUp += 10;
                  else if(d.value<595293) yUp += 20;
                  else if(d.value<1518892) yUp += 30;
                  
                  var xTrans = Math.sin(d.angle)*280;
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
                if(d.value<1518892) return "hidden";
                else return ""
              })
              
              .text(function(d) { 
                // if(rdr(d).gname.indexOf("&") > -1) {
                //   //d3.select("#text"+d.index).append("tspan");

                // }
                
                return rdr(d).gname; 
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
                  if(dd.sname == "No") {
                    var num = dd.tvalue/dd.ttotal;
                    var num2 = 4*num;
                    var num3 = d3.round(num2);
                   // console.log(dd.tname, num, num3);
                    //console.log()
                    
                    return chordFill2(num3);
                  }

                  else if(dd.sname == "Yes") {
                    var num = dd.tvalue/dd.ttotal;
                    var num2 = 4*num;
                    var num3 = d3.round(num2);
                    //console.log(dd.tname, num, num3);
                    
                    // Reverse the number
                    return chordFill2(4-num3);
                  }
                  else return "#f7f7f7";
                  // return dd.tname == "Independent oil & gas producers" ? "#00592d": "#ff6200"; 
                })
                .attr("d", d3.svg.chord().radius(r0))
                .on("mouseover", function (d) {
                  d3.select("#tooltip2")
                    .style("visibility", "visible")
                    .html(chordTip2(rdr(d)))
                    .style("top", function () { return (d3.event.pageY - 170)+"px"})
                    .style("left", function () { return (d3.event.pageX - 100)+"px";})
                })
               
                .on("mouseout", function (d) { d3.select("#tooltip22").style("visibility", "hidden") });  
                  function chordTip2 (d) {
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


          function groupTip2 (d) {
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

          function fillinfoBox2 (d) {
            var generalCongressInfo ="<h3>House of Representatives Make Up</h3>"
            // console.log( d);
            

            var p = d3.format(".1%"), q = d3.format(",f")
            
            // Fill in all the sub groups and how much they donated here
            // Maybe fill in special text for each one too.. idk. 
            var subGroups = { 
                            
                            "Fossil Fuels": { "Coal mining": {"Republicans":"$1,797,895.00","Democrats":"$31,000.00"} , "Oil Production":{"Democrats":"$10","Republicans":"$15"} },
                            "Construction": {"ILBC":"$10","SUA":"$1000"},
                            "Unions": {"ILBC":"$10","SUA":"$1000"},
                            "Ideological Groups": {"dumb ":"$10","SUA":"$1000"},
                            "Transportation": {"cars":"$10","SUA":"$1000"},
                            "Environmental policy": {"ILBC":"$10","SUA":"$1000"},
                            "Business Associations": {"ILBC":"$10","SUA":"$1000"},
                            "Alternate energy production & services": {"ILBC":"$10","SUA":"$1000"},
                            "Nuclear energy": {"ILBC":"$10","SUA":"$1000"},
                            "Other": {"ILBC":"$10","SUA":"$1000"},
                            "Materials & Manufacturing": {"ILBC":"$10","SUA":"$1000"}

                            };
            //_each
            var rows = ""; 
            
            var aGroup= subGroups[d.gname];
            _.forEach(aGroup, function(n, key) {
              console.log(key, n.Democrats)
              rows += "<tr><td>"+ key +"</td><td>" + n.Democrats +  "</td><td>" + n.Republicans + "</td></tr>";
            });
            var header = "<strong>" +d.gname + ":</strong> <br>";
            var strGroups = "Subgroups: <table> <tr> <th>Group</th><th>Democrats</th><th>Republicans</th>" + rows + "</table>";

            var strTotalDonate = "Contributed: $" + q(d.gvalue) + " (" + p(d.gvalue/(d.mtotal/2)) +" of total donations) <br>";
            var msg = header + strTotalDonate + strGroups ;
            return msg;
          
          }

          function mouseover2(d, i) {
            d3.select("#tooltip2")
              .style("visibility", "visible")
              .html(groupTip2(rdr(d)))
              .style("top", function () { return (d3.event.pageY - 80)+"px"})
              .style("left", function () { return (d3.event.pageX - 130)+"px";})

            
             
            d3.select("#infoBox2")
              .style("visibility", "visible")
              .html(groupTip2(rdr(d)))

            d3.select("#infoBox2")
              .style("visibility", "visible")
              .html(fillinfoBox2(rdr(d)))


            var textStringID = "#ext"+i;      
            d3.select(textStringID)
              .style("visibility", "visible")

            chordPaths.classed("fade", function(p) {
              return p.source.index != i
                  && p.target.index != i;
            });
          }
          function mouseout2(d, i) {
            
            d3.select("#tooltip2").style("visibility", "hidden") 
            //Only remove text labels for small tight groups
            if(d.value<1518892) {
              var textStringID = "#ext"+i;      
              d3.select(textStringID)
                .style("visibility", "hidden")
            }
          }
      }
