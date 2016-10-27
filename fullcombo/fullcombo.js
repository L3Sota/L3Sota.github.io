//hardcoded parameters
var svg_width = 1280;
var svg_height = 1000;
var graph_width = 800;
var graph_height = 800;
//derived parameters
var margin_x = svg_width - graph_width;
var margin_y = (svg_height - graph_height);
var graph_x = margin_x / 2;
var graph_y = margin_y / 2;
var title_y = - (margin_y / 4);
title_y = title_y > -16 ? -16 : title_y;
var key_pos = [graph_width*0.90, graph_height*0.0];
var types = [
    {'type': 'all'    ,'symbol': 'circle'},
    {'type': 'cute'   ,'symbol': 'circle'},
    {'type': 'cool'   ,'symbol': 'circle'},
    {'type': 'passion','symbol': 'circle'},
];

/**
 * Relative positions and margins in <svg>
 *+--------------------------------------------------------------+
 *|0,0(svg)->x  ^                          +                     |
 *||            |                          +                     |
 *|v            |graph_y                   +vertical margin      |
 *|y            |                          +                     |
 *|             v                          +                     |
 *|<--graph_x-->0,0(graph incl. points, axes, title)         |
 *|             ^<-----------graph_width----------->             |
 *|             |                                  |<--graph_x-->|
 *|             |                                  |             |
 *|             |                                  |             |
 *|             |                                  |             |
 *|+++++++++++++|                                  |+++++++++++++|
 *| horizontal  |graph_height                      | horizontal  |
 *|   margin    |                                  |   margin    |
 *|             |                                  |             |
 *|             |                                  |             |
 *|             |                                  |             |
 *|             |                                  |             |
 *|             v__________________________________|             |
 *|              ^                         +                     |
 *|              |                         +                     |
 *|              |graph_y                  +vertical margin      |
 *|              |                         +                     |
 *|              v                         +                     |
 *+--------------------------------------------------------------+<svg_width           
 *                                                               ^svg_height
 * The length of all horizontal +'s combined is margin_x.
 * The length of all   vertical +'s combined is margin_y.
 * The format assumes horizontal and vertical centering.
 **/

//svg
var svg = d3.select('body').append('svg')
    .attr('width', svg_width)
    .attr('height', svg_height);

//align container
graph = svg.append('g');

//start loading
d3.csv(
    'fullcombo19.csv',
    function(d) {
        return {
             name:  d.name,
             type: +d.type,
            level: +d.level,
            combo: +d.combo
        };
    },
    plot
);

//begin async

//graph position
graph.attr('transform', 'translate('+graph_x+','+graph_y+')');

//draw title
graph.append('text')
    .classed('graph-title', true)
    .attr('text-anchor', 'middle')
    .attr('x', graph_width/2)
    .attr('y', title_y)
    .text('Full Combo! An iM@S CG SS Graph');

//end async


//callback (data loaded)
function plot(data) {

    //scales
    var scale_x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.level; }))
        .range([0, graph_width]);
    var scale_y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.combo; })).nice()
        .range([graph_height, 0]);
    var scale_c = d3.scaleOrdinal()
        .domain([0,1,2,3])
        .range(['white','pink','blue','orange']);

    //axes
    var axis_x = d3.axisBottom().scale(scale_x).tickFormat(d3.format('d')).ticks(4);
    graph.append('g').attr('id', 'x-axis').call(axis_x)
        .attr('transform', 'translate(0,'+graph_height+')')
        .selectAll('.tick')//graph grid
        .append('line')
        .classed('grid', true)
        .attr('x1', 0.5)
        .attr('x2', 0.5)
        .attr('y2', -(graph_height));
    var axis_y = d3.axisLeft().scale(scale_y);//.tickFormat(d3.format('$,'));
    graph.append('g').attr('id', 'y-axis').call(axis_y)
        .selectAll('.tick')//graph grid
        .append('line')
        .classed('grid', true)
        .attr('x2', graph_width)
        .attr('y1', 0.5)
        .attr('y2', 0.5);

    var key_offset_x = [0, 20];
    var key_offset_y = 16;
    //draw key
    var key = graph.append('g')
        .attr('id', 'key')
        .attr('transform', 'translate('+key_pos[0]+','+key_pos[1]+')');
    for (var i = 0; i < types.length; i++) {
        var key_offset_y_i = i*key_offset_y;
        key.append('circle')
            .attr('transform', 'translate('+key_offset_x[0]+','+(key_offset_y_i)+')')
            .append('text')
            .attr('transform', 'translate('+key_offset_x[1]+','+(key_offset_y_i)+')')
            .text(function(d) { return types[i].symbol; });
    }

    //draw points
    points = graph.append('g').attr('id', 'points').selectAll('g').data(data);
    points.enter().append('g').merge(points)
        .classed('point', true)
        .classed('all', function(d) {return 'all' == types[d.type].type; })
        .classed('cute', function(d) {return 'cute' == types[d.type].type; })
        .classed('cool', function(d) {return 'cool' == types[d.type].type; })
        .classed('passion', function(d) {return 'passion' == types[d.type].type; })
        .attr('transform', function(d) {
            return 'translate('+scale_x(d.level)+','+scale_y(d.combo)+')';
        })
        .on('dblclick', freeze)
        .on('mouseover', highlight)
        .on('mouseout' , highlight)
        .append('circle')
        .attr('r', '10')
        .style('fill', function(d) { console.log(scale_c(d.type)); return scale_c(d.type); });

}

function freeze(d, i) {
    var toggle = !(d3.select(this).classed('frozen'))
    d3.select(this).classed('frozen', toggle);
}

//mouseover / mouseout listener
function highlight(d, i) {
    var moused = d3.event.type == 'mouseover';
    if (moused) {
        d3.select('#points').selectAll('.point').style('opacity', '0.1')
            .filter('.'+(types[d.type].type)).style('opacity', '0.7');
        d3.select('#points').selectAll('.frozen').style('opacity', '1.0');
        d3.select(this).style('opacity', '1.0')
        var data = [d.name];
        var popups = d3.select(this).selectAll('.popups').data(data);
        popups.enter().append('g').merge(popups)
            .classed('popups', true)
            .attr('transform', 'translate(15,0)')
            .append('text')
            .text(d.name)
    } else {
        d3.select('#points').selectAll('g').style('opacity', '1.0');
        var deletable = !(d3.select(this).classed('frozen'));
        if (deletable) { d3.select(this).selectAll('.popups').remove(); }
    }
}
