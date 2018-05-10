(function() {
  Polymer({

    is: 'og-bar-chart', 

    properties: {
      /**
      * Unit for Y-Axis values
      *
      * @property unit
      */
      unit: {
        type: String,
        value: ""
			},
			/**
      * Chart Width
      *
      * @property width
      */
      width: {
        type: Number,
        value: 960
			},
			/**
      * Chart Height
      *
      * @property height
      */
      height: {
        type: Number,
        value: 300
      },
      /**
			* This property is an Array of data.
			Member of each tab data looks like this
			`{"date":"2017-05-01T16:00:00.000Z","actual":"11960","target":"12950","design":"13960"}`
      *
      * @property data
      */
			data: {
				type: Array,
				value() {
					return [];
				},
        observer: "_redraw"
      },
      /**
       * Axis Configuration
       * Eg: {
						"x": {
							"tickFormat": ""
						},
						"y": {
							"tickFormat": ".3s",
							"hideGrid": true,
							"start": 600
						}
					}
       * @property axisConfig
       */
			axisConfig: {
				type: Object,
				value: () => {
					return {
						"x": {
							"tickFormat": "",
              "gridColor": "steelblue",
              "selectionColor": "fuchsia",
              "series": [
                {"color": "steelblue"},
                {"color": "yellow"},
                {"color": "green"},
                {"color": "red"},
                {"color": "gray"}
              ]
						},
						"y": {
							"tickFormat": ".3s",
							"start": 0,
							"gridColor": "steelblue"
						}
					};
				},
        observer: "_redraw"
      },
      /**
			* Margin for the charts
			Eg:
			`{top: 20, right: 20, bottom: 30, left: 50}`
      *
      * @property margins
      */
      margin: {
        type: Object,
        value() {
          return {};
        }
      },
      _selections: {
        type: Object,
        value() {
          return {"total": 0};
        }
      }
    },

    ready() {
      this.scopeSubtree(this.$.chart, true);
    },

    draw: function() {
      if(!this.data) {return;}
      let data = this._massageData(this.data);
			this._setDefaults();
      this._prepareChartingArea();
			this._prepareAxes(data);
      this._drawAxes(data);
      this.drawBars(data);
			this._drawGridLines(data);
      this.fire("chart-drawn", {});
    },
    
    _redraw: function(newData, oldData) {
      Px.d3.select(this.$.chart).selectAll("svg").remove();
			this.draw();
    },

    _massageData(data) {
			data.forEach((d) => {
				d.y = +d.y;
			});
			return data;
		},

    _setDefaults() {
			// set the dimensions and margins of the graph
			this._setDefaultMargin();
			
			this.axisConfig = this.axisConfig || {};
			this.axisConfig.x = this.axisConfig.x || {};
      this.axisConfig.y = this.axisConfig.y || {};
			this.axisConfig.x.axisColor = this.axisConfig.x.axisColor || '#95a5ae';
      this.axisConfig.y.axisColor = this.axisConfig.y.axisColor || '#95a5ae';
      this.customStyle['--x-grid-color'] = this.axisConfig.x.gridColor || this.axisConfig.x.axisColor;
			this.customStyle['--y-grid-color'] = this.axisConfig.y.gridColor || this.axisConfig.y.axisColor;
			this.customStyle['--font-size'] = "11px";
			this.updateStyles();
    },
    
    _setDefaultMargin() {
			this.margin = this.margin || {top: 20, right: 20, bottom: 30, left: 50};
      this.margin.top = this.margin.top || 20;
      this.margin.right = this.margin.right || 20;
      this.margin.bottom = this.margin.bottom || 30;
      this.margin.left = this.margin.left || 50;
      
      this.adjustedWidth = this.adjustedWidth || 
        (this.width - this.margin.left - this.margin.right),
      this.adjustedHeight = this.adjustedHeight || 
        (this.height - this.margin.top - this.margin.bottom);
    },
    
    _prepareChartingArea() {
			let d3 = Px.d3;
			this.svg = d3.select(this.$.chart).append("svg")
					.attr("viewBox", "0 0 "+this.width+" "+this.height)
					.attr("width", "100%")
					.attr("height", "100%")
					.attr("preserveAspectRatio", "xMidYMid meet")
				.append("g")
					.attr("transform",
					 			"translate(" + this.margin.left + "," + this.margin.top + ")");
		},
		_prepareAxes(data) {
			let d3 = Px.d3;
      this.x = d3.scaleBand().rangeRound([0, this.adjustedWidth])
        .padding(this.axisConfig.x.padding || 0.3);
			this.y = d3.scaleLinear().rangeRound([this.adjustedHeight, 0]).clamp(true);

			this.x.domain(data.map(function(d) { return d.x; }));
      this.y.domain([this.axisConfig.y.start || 0, 
        this.axisConfig.y.end ||d3.max(data, function(d) { return d.y; })]);
		},
		_drawAxes(data) {
      let x= this.x, y=this.y, me = this, d3 = Px.d3;
      if(!this.margin.top) {
        this._setDefaultMargin();
      }
			// Add the X Axis
      this.xAxis = d3.axisBottom(x);
      let _xAxis = this.xAxis;
			if(this.axisConfig.x.ticks) {
				_xAxis.ticks(this.axisConfig.x.ticks);
			}
			this.svg.append("g")
					.attr("transform", "translate(0," + this.adjustedHeight + ")")
					.attr("class", "x-axis")
					.call(_xAxis);

      // Add the Y Axis
      this.yAxis = d3.axisLeft(y);
			let _yAxis = this.yAxis;
			if(this.axisConfig.y.ticks) {
				_yAxis.ticks(this.axisConfig.y.ticks);
			}
			this.svg.append("g")
					.attr("class", "y-axis")
					.call(_yAxis);

			this.svg.append("text")
					.attr("transform", "rotate(-90)")
          .attr("y", this.axisConfig.y.unitPadding ? 
            this.axisConfig.y.unitPadding  : -this.margin.left)
					.attr("x", 0 - (this.adjustedHeight / 2))
					.attr("dy", "1em")
          .attr("class", "yaxis-label")
          .style("overflow", "clip")
					.text(this.unit);
    },
    drawBars(data) {
      let x= this.x, y=this.y, me = this, d3 = Px.d3;
      this.svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", (d) => { return x(d.x); })
          .attr("y", (d) => { return y(d.y); })
          .style("fill", (d, i) => {
            if(this.axisConfig.x.series && this.axisConfig.x.series.length > i) {
              return this.axisConfig.x.series[i].color || "steelblue";
            }
            return "steelblue";
          })
          .attr("width", x.bandwidth())
          .attr("height", (d) => { return this.adjustedHeight - y(d.y); })
          .on('click', function(d, i) {
            if(me.axisConfig.x.selectionColor) {
              d3.select(this).style("fill", me.axisConfig.x.selectionColor);
              if(me._selections[i]) {
                let color = "steelblue";
                if(me.axisConfig.x.series && me.axisConfig.x.series.length > i) {
                  color = me.axisConfig.x.series[i].color || "steelblue";
                }
                d3.select(this).style("fill", color);
              }
            }
            if(me._selections[i]) {
              delete me._selections[i];
              me._selections.total--;
            } else {
              me._selections[i] = true;
              me._selections.total++;
            }
            me.fire("bar-clicked", {"point": d, "data": data, 
              "index": i, "selections": me._selections});
          });
    },
		_drawGridLines(data) {
			let x= this.x, y=this.y, me = this, d3 = Px.d3;
      if(!this.axisConfig.x.hideGrid) {
        this.svg.append("g")
					.attr("class", "grid x-grid")
          .call(d3.axisBottom(x)
              .ticks(this.axisConfig.x.totalGridLines || 5)
              .tickSize(this.adjustedHeight)
              .tickFormat(""));
      }

      if(!this.axisConfig.y.hideGrid) {
        this.svg.append("g")
					.attr("class", "grid y-grid")
          .call(d3.axisLeft(y)
              .ticks(this.axisConfig.y.totalGridLines || 5)
              .tickSize(-this.adjustedWidth)
              .tickFormat(""));
      }
		}
  });
})();
