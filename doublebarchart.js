define(["jquery", "text!./doublebarchart.css","./d3.min"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 4,
					qHeight : 1000
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max : 1 
				},
				measures : {
					uses : "measures",
					min : 2,
					max : 2
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element,layout) {
			console.log($element);
			console.log(layout);
			
          
			//Get qMatrix data array
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
          	
          	//Create new array that contains the dimension labels
            var dimensionLabels = layout.qHyperCube.qDimensionInfo.map(function(d) {
              return d.qFallbackTitle;
            });
          
          	//Create new array that contains the measure labels
          	var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
          		return d.qFallbackTitle;
          	});
            
          	//Create a new array for our extension with a row for each row in the qMatrix
          	var data = qMatrix.map(function (d){
          		//for each element in the matrix, create a new object that has a property
              	//for the grouping dimension, the first metric, and the second metric
              return {
                "Dim1":d[0].qText,
                "Metric1":d[1].qNum,
                "Metric2":d[2].qNum
              }
            });
			
          // Chart object width
          var width = $element.width();
          // Chart object height
          var height = $element.height();
          // Chart object id
          var id = "container_" + layout.qInfo.qId;
          
          //Check to see if the chart element has already been created
          if(document.getElementById(id)){
            //if it has been created, empty its content so we can redraw it
            $("#" + id).empty();
          }
          else{
            //if it hasn't been created, create it with the appropriate id and size
            $element.append($('<div />').attr("id", id).width(width).height(height));
          }
          
          viz(data,dimensionLabels,measureLabels,width,height,id);
          
        }
	};
});

var viz = function(data,dimensionLabels,measureLabels,width,height,id){
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    //Width and Height values
    width = width - margin.left - margin.right,
	height = height - margin.top - margin.bottom;
 
    //Scale for names
  	var x = d3.scale.ordinal()
    	.rangeBands([0, width]);
     
    var y = d3.scale.linear()
        .range([height, 0]);
     
    var color = d3.scale.category10();
     
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
     
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    	
  	//Get names from data matrix
    var names = data.map(function(d){
      return d.Dim1;
    });

    x.domain(names);
	var max1 = d3.max(data, function(d) { return d.Metric1; });
	var max2 = d3.max(data, function(d) { return d.Metric2; });
	var maxValue = d3.max([max1, max2]);
	console.info(maxValue);
    y.domain([0, maxValue]).nice();
  
  	var barWidth = (width - names.length*10)/names.length;
  	var miniBarWidthPercent = 0.6;
  	var miniBarWidth = barWidth * miniBarWidthPercent;
  
  	//Append new element to the div container we just created
    var svg = d3.select("#"+id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  	var bars2 = svg.append("g")
    	.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text(dimensionLabels[0]);//Label form qMatrix data
    
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    //.attr("transform", "rotate(-90)")
    .attr("y", function(d){return y(d3.max(data, function(d) { return d.Metric1; }));})
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text(measureLabels[0]);//Label form qMatrix data
  
  	svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    //.attr("transform", "rotate(-90)")
    .attr("y", function(d){return y(d3.max(data, function(d) { return d.Metric2; }));})
    .attr("dy", ".71em")
    .style("text-anchor", "start")
    .text(measureLabels[1]);//Label form qMatrix data
    
    svg.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("class", "rect")
    .attr("width", barWidth)
    .attr("x", function(d, i){return i * x.rangeBand();})
    .attr("fill", '#0080FF')
    .attr("fill-opacity", 0.5)
    .attr("y", function(d){return y(d.Metric1);})
    .attr("height", function(d){return height - y(d.Metric1);});
  
  	bars2.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("class", "rect")
    .attr("width", miniBarWidth)
    .attr("x", function(d, i){return (i * x.rangeBand()) + (barWidth * ((1 - miniBarWidthPercent)/2));})
    .attr("fill", '#0080FF')
    .attr("y", function(d){return y(d.Metric2);})
    .attr("height", function(d){return height - y(d.Metric2);});
  
}

function objToString(obj) {
            var str = '';
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str += p + '->' + obj[p] + '<br/><br/>';
                }
            }
            return str;
        }
