// 理解成關聯性資料
var links = [
    { sn:1 ,source: "Microsoft", target: "Amazon", type: "licensing", label: "tesxt" },
    { sn:2 ,source: "Microsoft", target: "HTC", type: "licensing", label: "non-profit" },
    { sn:3 ,source: "Samsung", target: "Apple", type: "suit", label: "investment" },
    { sn:4 ,source: "Motorola", target: "Apple", type: "suit", label: "test" },
    { sn:5 ,source: "Nokia", target: "Apple", type: "resolved", label: "hello" },
    { sn:6 ,source: "HTC", target: "Apple", type: "suit", label: "relations" },
    { sn:7 ,source: "Kodak", target: "Apple", type: "suit", label: "100" },
    { sn:8 ,source: "Microsoft", target: "Barnes & Noble", type: "suit", label: "200" },
    { sn:9 ,source: "Microsoft", target: "Foxconn", type: "suit", label: "400" },
    { sn:10 ,source: "Oracle", target: "Google", type: "suit", label: "non-profit" },
    { sn:11 ,source: "Apple", target: "HTC", type: "suit", label: "string" },
    { sn:12 ,source: "Microsoft", target: "Inventec", type: "suit", label: "458" },
    { sn:13 ,source: "Samsung", target: "Kodak", type: "resolved", label: "199" },
    { sn:14 ,source: "LG", target: "Kodak", type: "resolved", label: "210" },
    { sn:15 ,source: "RIM", target: "Kodak", type: "suit", label: "text me" },
    { sn:16 ,source: "Sony", target: "LG", type: "suit", label: "hey" },
    { sn:17 ,source: "Kodak", target: "LG", type: "resolved", label: "you" },
    { sn:18 ,source: "Apple", target: "Nokia", type: "resolved", label: "0.52" },
    { sn:19 ,source: "Qualcomm", target: "Nokia", type: "resolved", label: "55" },
    { sn:20 ,source: "Apple", target: "Motorola", type: "suit", label: "1.89" },
    { sn:21 ,source: "Microsoft", target: "Motorola", type: "suit", label: "14.17" },
    { sn:22 ,source: "Motorola", target: "Microsoft", type: "suit", label: "55" },
    { sn:23 ,source: "Huawei", target: "ZTE", type: "suit", label: "try" },
    { sn:24 ,source: "Ericsson", target: "ZTE", type: "suit", label: "free" },
    { sn:25 ,source: "Kodak", target: "Samsung", type: "resolved", label: "love" },
    { sn:26 ,source: "Apple", target: "Samsung", type: "suit", label: "song" },
    { sn:27 ,source: "Kodak", target: "RIM", type: "suit", label: "ok" },
    { sn:28 ,source: "Nokia", target: "Qualcomm", type: "suit", label: "200" }
];

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function (link) {
    link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
    link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
});

var width = 1200,
    height = 800;
var color = d3.scale.category20c();

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(180)
    .charge(-500)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
    .attr("id", function (d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");


var groupRoute = svg.selectAll("g")
.data(force.links())
.enter().append("g");

var path = groupRoute.attr("class","router").append("path")
    .attr("class", function (d) { return "link " + d.type; })
    .attr("marker-end", function (d) { return "url(#" + d.type + ")"; })
    .attr("id", function (d) { return "link" + d.sn; });


function labelText(d){
    return d.sn;
}

// 這邊要研究加上資料的寫法
var labels = groupRoute.append("text")
    .append('textPath').attr({
		'xlink:href': (d)=>{return '#link'+ d.sn}
    }).attr('startOffset','50%')
    // 這邊可能要寫數學去計算如何放在中間
    .attr("class","text")
    .attr("fill",(d)=>{return color(d.sn)})
    .style("font-size",'14px')
    .text((d)=>{return d.label});

    // .attr("text-anchor", "middle") not working
    

var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("text");




var nodes = svg.selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("g")
    .attr("class", "node")
    .call(force.drag)
    .on("mouseover", function(){return tooltip.style("visibility", "visible");})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden");});




// 球球
var circles = nodes.append("circle")
    .attr("fill",(d)=>{return color(d.name.length * 5)})
    .attr("r", function (d) { d.radius = d.name.length * 5; return d.radius; });


    
// 球球上的文字
var texts = nodes.append("text")
    .attr("text-anchor", "middle")
    .text(function (d) {
        return d.name;
    });





// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
    // 這段是在控制 path 的指向，去呼叫 linkArc function 計算要從哪裡連到哪裡
    path.attr("d", linkArc);
    // 控制 node 球球的位置
    nodes.attr("transform", transform);
}

function linkArc(d) {
    // console.log(d.target.x-d.radius)
    var tX = d.target.x - d.target.radius;
    var dx = tX - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + tX + "," + d.target.y;
}

function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
}