
// margin conventions & svg drawing area - since we only have one chart, it's ok to have these stored as global variables
// ultimately, we will create dashboards with multiple graphs where having the margin conventions live in the global
// variable space is no longer a feasible strategy.

let margin = {top: 40, right: 40, bottom: 60, left: 60};

let width = 600 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");

// Initialize data
loadData();

// FIFA world cup
let data;

// create axis scales

let x = d3.scaleTime()
	.range([0, width])

let y = d3.scaleLinear()
	.range([height, 0])

// initialize axis
let yAxis = d3.axisLeft()
	.scale(y)

let xAxis = d3.axisBottom()
	.scale(x)

let yAxisGroup = svg.append("g")
	.attr("class", "y-axis axis")
	.attr("transform", "translate(0,0)")

let xAxisGroup = svg.append("g")
	.attr("class", "x-axis axis")
	.attr("transform", "translate(0," + height + ")")


var slider = document.getElementById('time-period-slider');


// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv", row => {
		row.YEAR = parseDate(row.YEAR);
		row.TEAMS = +row.TEAMS;
		row.MATCHES = +row.MATCHES;
		row.GOALS = +row.GOALS;
		row.AVERAGE_GOALS = +row.AVERAGE_GOALS;
		row.AVERAGE_ATTENDANCE = +row.AVERAGE_ATTENDANCE;
		return row
	}).then(csv => {

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization(data);
	});
}




// Render visualization
function updateVisualization(data) {

	console.log(data);

	let selection = d3.select("#y-axis-selection").property("value");


	x.domain([d3.min(data, d=> d.YEAR), d3.max(data, d=> d.YEAR)])
	y.domain([0, d3.max(data, d=> d[selection])])


	let line = d3.line()
		.x(function(d) {return x(d.YEAR)})
		.y(function(d) {return y(d[selection]) })

	let lines = svg.append("path")
		.attr("class", "line")

	svg.select(".line")
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("d", line(data))

	// add dots
	let circles = svg.selectAll("circle")
		.data(data)

	circles.exit().remove()

	circles.enter().append("circle")
		.merge(circles)
		.transition()
		.duration(800)
		.attr("cx", (d) => x(d.YEAR))
		.attr("cy", (d) => y(d[selection]))
		.attr("r", 5)
		.attr("fill", "green")

	circles.on("click", function(event, d) {
		console.log("happy")
		showEdition(d)
	})


	// update/make axes
	svg.select(".y-axis")
		.transition()
		.duration(800)
		.call(yAxis);
	svg.select(".x-axis")
		.transition()
		.duration(800)
		.call(xAxis);

	makeSlider()


}

function makeSlider() {

	let formatDate = d3.timeFormat("%Y")
	let minTime = +formatDate((d3.min(data, (d) => d.YEAR)))
	let maxTime = +formatDate((d3.max(data, (d) => d.YEAR)))


	console.log(minTime, maxTime)

	noUiSlider.create(slider, {
		start: [minTime, maxTime],
		connect: true,
		step: 1,
		range: {
			'min': [minTime],
			'max': [maxTime]
		}
	});

	slider.noUiSlider.on("update", function(values, handle, unencoded, tap, positions, noUiSlider) {

		let parseDate = d3.timeFormat("%Y")

		console.log(+parseDate(data[0].YEAR))

		filtereddata = data.filter((d) => +parseDate(d.YEAR) >= values[0] && +parseDate(d.YEAR) <= values[1])

		document.getElementById("range_values").innerText = "Date Range: " + Math.round(values[0]) + " - " + Math.round(values[1]);

		updateVisualization(filtereddata)



	})
}


// Show details for a specific FIFA World Cup
function showEdition(d){
	document.getElementById("title").innerText = d.EDITION;
	document.getElementById("winner").innerText = d.WINNER;
	document.getElementById("goals").innerText = d.GOALS
	document.getElementById("average_goals").innerText = d.AVERAGE_GOALS
	document.getElementById("matches").innerText = d.MATCHES
	document.getElementById("teams").innerText = d.TEAMS
	document.getElementById("average_attendance").innerText = d.AVERAGE_ATTENDANCE


}
