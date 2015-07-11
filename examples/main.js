var Graph = (function(window){
	
	var d3 = window.d3,
		_  = window._;

	function newGraph(config) {
		d3.json(config, function(err, data) {
			err ? handleError(err) : init(data);
		});
	}

	function handleError(err) {
		console.error("Error: ", err);
	}
	
	/**
	 * Create a function that will map a component depenency to a directed graph link
	 *
	 * @param {object} source The source component
	 * @param {array} components Array of all components in the graph
	 */
	function dependencyToLinkMapper(source, components) {
		return function(dep) {
			return {
				source : source,
				target : findComponent(components, dep.target),
				type   : dep.type || "sync"
			};
		}
	}

	function findComponent(components, id) {
		return _.find(components, function(c) { return c.id == id });
	}

	function init(data) {
		var nodes = data.components,
			links = [],
			linkedByIndex = {},
			toggle = false;

		_.forEach(data.components, function(c) {
			links = links.concat(_.map(c["depends-on"] || [], dependencyToLinkMapper(c, data.components)))
			
			// Add link to self to linkedByIndex
			linkedByIndex[c.id + "," + c.id] = true;
		});

		_.forEach(links, function(l) {
			linkedByIndex[l.source.id + "," + l.target.id] = true;
			linkedByIndex[l.target.id + "," + l.source.id] = true;
		});
		
		function toggleConnectedNodes() {
			if (!toggle) {
				d = d3.select(this).datum();

				circle.style("opacity", function(o) {
					return (linkedByIndex[d.id + "," + o.id] || linkedByIndex[o.id, + "," + d.id]) ? 1 : 0.1;
				});

				text.style("opacity", function(o) {
					return (linkedByIndex[d.id + "," + o.id] || linkedByIndex[o.id, + "," + d.id]) ? 1 : 0.1;
				});

				path.style("opacity", function(o) {
					return (d.index == o.source.index || d.index == o.target.index) ? 1 : 0.1;
				});
			} else {
				circle.style("opacity", 1);
				path.style("opacity", 1);
				text.style("opacity", 1);
			}

			toggle = !toggle;
		}



var width = 960,
    height = 500;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
    .data(["sync", "async"])
  .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5");

var path = svg.append("g").selectAll("path")
    .data(force.links())
  .enter().append("path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
  .enter().append("circle")
    .attr("r", 6)
    .call(force.drag)
	.on('dblclick', toggleConnectedNodes);

var text = svg.append("g").selectAll("text")
    .data(force.nodes())
  .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.title; });

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", linkArc);
  circle.attr("transform", transform);
  text.attr("transform", transform);
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}



	}


	return {
		newGraph : newGraph	
	}
})(window);
