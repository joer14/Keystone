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

      var repubColor = "rgb(247, 25, 25)";
      var demoColor = "#2166ac";
      var groupColor = "rgb(95, 189, 4)";//"rgb(64,200,49)"
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
                if((b == demoVal)&&(a == repubVal)) return 1;

                // if((a == republicans)&&(b == demoVal)) return -1;
                // if((b == democrats)&&(a == repubVal)) return -1;
                
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
            .attr("width", w+400)
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
            .style("stroke", "white")
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
              .attr("x", 670)
              .attr("transform", "translate(10,90)")
              .attr("y", function(d, i){ 
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
              .attr("transform", "translate(15,105)")
              .attr("x", 690)
              //.attr("y", 50)
              //.attr("dy", ".35em")
              .attr("y", function(d, i){ 
                 return i * 40;
              })
              .style("font-size", "12px")
             .text(function(d) {
                switch(d){
                  case 4: return ">80% D";
                  case 3: return ">60% D ";
                  case 2: return "~50% D/R";
                  case 1: return ">60% R";
                  case 0: return ">80% R";
                }

                return d;
              })
            legend.append("text")
                .attr("x", 700)
                //.attr("y", "30")
                .attr("dy", "6em")
                .style("text-anchor", "middle")
                .style("font-size", "10pt")
                .text("Contribution Breakdown:");
           
            legend.append("text")
                .attr("x", 750)
                .attr("dy", "30em")
                .style("text-anchor", "middle")
                .style("font-size", "12pt")
                .style("fill", "rgb(33, 102, 172")       
                .text("Democrats: 188(43%)");
            
            legend.append("text")
                .attr("x", 755)
                .attr("dy", "31em")
                .style("text-anchor", "middle")
                .style("font-size", "12pt")
                .style("fill", "rgb(200, 15, 15)")
                .text("Republicans: 245(56%)");
                      
             legend.append("text")
                .attr("x", 750)
                .attr("dy", "35em")
                .style("text-anchor", "middle")
                .style("font-size", "50pt")
                .style("font-color", "steelblue")
                .text("Data: Campaign Contributions from Oct 1, 2012 to Sept 30, 2014.");
            
            legend.append("text")
                .attr("x", 755)
                .attr("dy", "51em")
                .style("text-anchor", "middle")
                .style("font-size", "12pt")
                .text("Republicans: 245(56%)");
            

         
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
                    var msg= "<strong></strong>"
                      

                      
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
            // d.gdata
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
                            
                            "Fossil Fuels": { "Coal mining": { "Republicans":"$1,797,895", "Democrats":"$31,000"}, "Electric Power Utilities": { "Republicans":"$2,769,115","Democrats":"$1,106,153"},"Energy Production & Distribution":{ "Republicans":"$944,911","Democrats":"$168,568"}, "Gas & Electric Utilities":{"Republicans":"$2,497,348","Democrats":"$1,458,983"}, "Fuel Oil Dealers":{"Republicans":"$9,950","Democrats":"$8,700"}, "Independent Oil & Gas Producers":{"Republicans":"$3,075,761","Democrats":"$221,420"},"LPG/Liquid Propane Dealers & Producers":{"Republicans":"$113,100","Democrats":"$13,000"}, "Natural Gas transmission & distribution":{"Republicans":"$1,618,810", "Democrats":"$353,880"},  "Oilfield service, equipment & exploration":{"Republicans":"$1,720,694", "Democrats":"$122,000"}, "Major (multinational) oil & gas producers":{"Republicans":"$2,401,775.00", "Democrats":"$327,400"} ,"Oil and Gas":{"Republicans":"$2,032,513","Democrats":"$165,125"}, "Power plant construction & equipment":{"Republicans":"$595,488","Democrats":"$179,200"} , "Petroleum refining & marketing":{"Republicans":"$2,940,985", "Democrats":"$255,225"} },
               
                "Materials & Manufacturing" : { "Industrial/Commercial Equipment & Materials" : { "Republicans" : "$3,221,728" , "Democrats" : "$1,356,742"}, "Metal mining & processing": { "Republicans" : "$304,700" , "Democrats" : "$76,500"}, "Steel":{ "Republicans": "$891,324", "Democrats": "$177,600"}, "Stone, Clay, Glass & Concrete Products":{ "Republicans": "$1,986,475", "Democrats": "$483,400"}, "Chemicals" : {"Republicans" : "$2,013,952", "Democrats": "$463,508"}, "Agricultural Chemicals (fertilizers & pesticides)" : {"Republicans" : "$447,200", "Democrats" : "$151,012"}, "Plumbing & Pipe Products" : {"Republicans" : "$129,940", "Democrats": "$22,700"}, "Manufacturing" : {"Republicans" : "$152,330", "Democrats": "$15,086"},  "Food and Kindred Products Manufacturing" : {"Republicans" : "$1,071,196", "Democrats": "$334,475"}, "Department, variety & convenience stores" : {"Republicans" : "$1,414,585", "Democrats": "$732,950"},  "Forestry & Forest Products" : {"Republicans" : "$1,438,038", "Democrats": "$416,933"} }, 
               

                
                "Transportation" : {"Airlines":{ "Republicans": "$886,100", "Democrats": "$533,285"}, "Bus Services" : {"Republicans" : "$128,450", "Democrats": "$32,350"}, "Sea freight & passenger services" : {"Republicans" : "$702,164", "Democrats" : "$457,106"}, "Sea transport" : {"Republicans" : "$114,308", "Democrats": "$68,435"}, "Transportation" : {"Republicans" : "$248,600", "Democrats": "$43,700"}, "Trucking Companies & Services" : {"Republicans" : "$1,551,425", "Democrats": "$262,000"}}, 



                            "Construction" : { "Public works, industrial & commercial construction" : { "Republicans" : "$2,258,172" , "Democrats" : "$700,079"}, "Construction equipment": { "Republicans" : "$747,800" , "Democrats" : "$114,567"}, "Equipment rental & leasing":{ "Republicans": "$270,971", "Democrats": "$134,700"}, "Electrical contractors":{ "Republicans": "$817,885", "Democrats": "$307,750"}, "Engineering, architecture & construction mgmt svcs" : {"Republicans" : "$2,196,119", "Democrats": "$1,426,592"}, "Residential construction" : {"Republicans" : "$1,949,133", "Democrats" : "$592,051"}, "Special trade contractors" : {"Republicans" : "$744,627", "Democrats": "$231,535"}, "Plumbing, Heating & Air conditioning": {"Republicans" : "$423,407", "Democrats" : "$187,790"} },
                "Unions" : {"Building Trades Unions":{ "Republicans": "$1,484,550", "Democrats": "$7,531,333"}, "IBEW (Intl Brotherhood of Electrical Workers)" : {"Republicans" : "$52,590", "Democrats": "$1,568,775"}, "Teamsters union"  : {"Republicans" : "$81,500", "Democrats" : "$1,093,850"} },
                
                "Business Associations" : {"General business associations":{ "Republicans": "$540,310", "Democrats": "$177,250"}, "Chambers of commerce" : {"Republicans" : "$173,819", "Democrats": "$34,025"}, "Small business associations"  : {"Republicans" : "$22,550", "Democrats" : "$529,238"}, "Fiscal & tax policy"  : {"Republicans" : "$40,450", "Democrats" : "$1,250"} },
                "Ideological Groups" : {"Republican/Conservative":{ "Republicans": "$5,754,017", "Democrats": "$23,100"}, "Minority/Ethnic Groups" : {"Republicans" : "$263,906", "Democrats": "$762,577"}, "Pro-resource development groups"  : {"Republicans" : "$2,500", "Democrats" : "None"} },
                
                "Alternate energy production & services" : {"Alternate energy production & services":{"Republicans": "$337,300", "Democrats": "$257,992"}},

                "Environmental Policy" : {"Environmental Policy":{ "Republicans": "$224,458", "Democrats": "$1,334,030"}},

                "Homeland Security contractors" : {"Homeland Security contractors":{ "Republicans": "$54,050", "Democrats": "$35,000"}},

                "Nuclear energy" : {"Nuclear energy":{ "Republicans": "$256,450", "Democrats": "$179,450"}}, 

                            };
            //_each
            var rows = ""; 
            
            var aGroup= subGroups[d.gname];
            _.forEach(aGroup, function(n, key) {
                var demStr = n.Democrats;
                demStr = demStr.replace(/,/g, "");
                demStr = parseInt(demStr.replace("$", ""));
                demStr = q(demStr);
                //console.log(n.Democrats)
                //console.log(q(parseInt(n.Democrats)))
                var repStr = n.Republicans;
                repStr = repStr.replace(/,/g, "");
                repStr = parseInt(repStr.replace("$", ""));
                repStr = q(repStr);
                rows += '<tr><td><br>'+ key +'</br></td><td style="color: steelblue"><br>' + demStr +  '</br></td><td style="color: rgb(247, 25, 25)"><br>' +  repStr+ '</br></td></tr>';
            });
            var header = "<strong>" +d.gname + ":</strong> <br>";
            var strGroups = '<table style="font-size: 12px">' + rows + "</table>";

            var strTotalDonate = "Contributed: " + q(d.gvalue) + " (" + p(d.gvalue/(d.mtotal/2)) +" of total donations) <br>";
            var msg = header + strGroups;
            return msg;
          
          }

          function mouseover(d, i) {
            d3.select("#tooltip")
              .style("visibility", "visible")
              .style("background-color", "lightgray")
              .style("color", "black")
              .html(groupTip(rdr(d)))
              .style("top", function () { return (d3.event.pageY - 80)+"px"})
              .style("left", function () { return (d3.event.pageX - 130)+"px";})

            
             
            d3.select("#infoBox")
              .style("font-size", "10pt")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))

            d3.select("#infoBox")
              .style("font-size", "10pt")
              //.style("visibility", "visible")
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
            d3.select("#infoBox")
              .style("font-size", "10pt")
              //.style("visibility", "visible")
              .html("")


            d3.select("#tooltip").style("visibility", "hidden") 
            //Only remove text labels for small tight groups
            if(d.value<1558488) {
              var textStringID = "#text"+i;      
              d3.select(textStringID)
                .style("visibility", "hidden")
            }
          }


          
      }

