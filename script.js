const DATASETS = {
    videogames: {
      TITLE: 'Video Game Sales',
      DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
      FILE_PATH:
        'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
    },
    movies: {
      TITLE: 'Movie Sales',
      DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
      FILE_PATH:
        'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
    },
    kickstarter: {
      TITLE: 'Kickstarter Pledges',
      DESCRIPTION:
        'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
      FILE_PATH:
        'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
    }
  };

const urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = 'videogames';
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

document.getElementById('title').innerText = DATASET.TITLE;
document.getElementById('description').innerText = DATASET.DESCRIPTION;

const body = d3.select('body');
const width = 1100;
const height = 600;

body.append('svg')
    .attr('id', 'treemap')
    .attr('width', width)
    .attr('height', height)

const svg = d3.select('#treemap');


d3.json(DATASET.FILE_PATH)
        .then( data => readyFunction(data))
        .catch(err => console.log(err))

function readyFunction (receiveData) {
    const color = d3.scaleOrdinal(
                    receiveData.children.map(d => d.name),
                    [ //20 color categories
                        '#1f77b4',
                        '#aec7e8',
                        '#ff7f0e',
                        '#ffbb78',
                        '#2ca02c',
                        '#98df8a',
                        '#d62728',
                        '#ff9896',
                        '#9467bd',
                        '#c5b0d5',
                        '#8c564b',
                        '#c49c94',
                        '#e377c2',
                        '#f7b6d2',
                        '#7f7f7f',
                        '#c7c7c7',
                        '#bcbd22',
                        '#dbdb8d',
                        '#17becf',
                        '#9edae5'
                      ]);

    //Compute the layout
    const root = d3.hierarchy(receiveData)
                    .sum(d => d.value)
                    .sort((a,b)=> b.value - a.value);

    d3.treemap()
      .tile(d3.treemapResquarify)
      .size([width,height])
      .padding(1)
      .round(true)
      (root);

    //Define tooltip
    const tooltip = body.append('div')
                        .attr('id','tooltip')
                        .style('opacity', 0);
                  
    //Add a cell for each leaf of the hierarchy
    const leaf = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`)
        .on('mousemove', (event, d)=> {
            tooltip.transition()
                    .duration(1000)
            tooltip.style('opacity', 0.7)
            tooltip.attr('data-value', d.data.value)
            tooltip.html(
                `Name: ${d.data.name} <br>
                Category: ${d.data.category} <br>
                Value: ${d.data.value}
                `
            )
            tooltip.style('top', event.pageY - 70 + 'px')
            tooltip.style('left', event.pageX + 15 + 'px')
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0)
        });
    
    //Append a color rectangle
    leaf.append('rect')
        .attr('id', d => d.data.id)
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-value', d => d.data.value)
        .attr('data-category', d => d.data.category)
        .attr('fill', d => color(d.data.category))
        .attr('fill-opacity', 0.6)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

    leaf.append('text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('font-size', '0.6rem')
        .attr('x', 4)
        .attr('y', (d, i) => 13 + 10*i)
        .text(d => d)

    const legendSvg = body.append('svg')
                            .attr('id','legend')
                            .attr('width', 960)
                            .attr('height', 50);

    const legendPadding = 25;

    legendSvg.selectAll('rect')
        .data(root.children)
        .enter()
        .append('rect')
        .attr('class', 'legend-item')
        .style('stroke', 'white')
        .attr('x', (d, i) => i * 140)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', d => color(d.data.name));

    legendSvg.selectAll('text')
            .data(root.children)
            .enter()
            .append('text')
            .attr('x', (d,i) => i * 140 + legendPadding)
            .attr('y', 15)
            .text(d => d.data.name)
}