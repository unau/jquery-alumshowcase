(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function($, undefined) {
  var pluginName = 'alumShowcase',
      defaults = {
        cell: 'cell',
        condition: 'condition',
        choice: 'choice'
      };

  function as$$(defs) {
    var p = this.prototype;
    p.initAs$$ = function(element, opts) {
      this.element = element;
      this.$$ = $(element);
      this.opts = opts || {};
      if (this.opts.parent) {
	for (var key in this.opts.parent) {
	  this[key] = this.opts.parent[key];
	}
      }
      this.data = {};
      var data = this.$$.data();
      var m;
      for (var key in data) {
	if (m = key.match(/^alumsc(.+)$/)) {
	  this.data[m[1]] = data[key];
	}
      }
      this.init();
      return this;
    };
    defs(p);
  }

  /**
   * Cell クラス
   */
  var Cell = function(element) {
    this.initAs$$(element);
  };
  as$$.call(Cell, function(p) {
    p.init = function() {
      this.v = {};
      return this;
    };

    var hide = function($$, position) {
      $$.animate({opacity: 0}, 1000,
                 function() {
                   $$.hide();
                 });
    };
    var show = function($$, position) {
      $$.show();
      $$.animate($.extend({opacity: 1}, position), 1000);
    };
    
    /**
     * cell を case 内に配置するよ
     */
    p.redisplay = function(position) {
      // 今、表示されていなくて、次、表示すべきなら出すよ
      // if (! this.enabled && this.next.enabled) {
      if (this.next.enabled) {
        show(this.$$, position);
      }
      // 今、表示されてて、次、表示すべきでないなら隠すよ
      // if (this.enabled && ! this.next.enabled) {
      if (! this.next.enabled) {
        hide(this.$$, position);
      }
      this.enabled = this.next.enabled;
      return this;
    };
  });

  /**
   * Cage クラス
   */
  var Cage = function Cage(element, showcase) {
    this.initAs$$(element, { parent: { showcase: showcase } });
  };
  as$$.call(Cage, function(p) {
    p.init = function() {
      return this;
    };

    p.loadCellData = function() {
      var cage = this;
      var showcase = cage.showcase;
      var args = showcase.args;
      if (typeof args.cells === 'object') {
        var cells = args.cells;
        if (cells.source && typeof cells.callback === 'function') {
          cage.$$.empty();
          $.getJSON(cells.source,
                    function(json) {
                      cells.callback(
			cage.$$, json,
                        function() {
                          cage.cells = { seq: [] };
                          cage.$$.find('.cell').each(function() {
			    var cell = new Cell(this);
                            cage.cells.seq.push(cell);
			    cell.hint = showcase.getHint4cell(cell);
                          });
			  cage.current = {
			    cells: cage.cells.seq,
			    key: 'seq',
			    direction: 'asc'
			  };
			  // showcase.makeSortedCellList();
                          cage.redisplay();
                        })
                    });
        }
      }
      return this;
    };
    
    p.setSortOrder = function(sortOrder) {
      var key = sortOrder.key;
      if (! this.cells[key]) {
	var getter = sortOrder.getGetter();
	this.eachCell(function(cell) {
	  cell.v[key] = getter(cell.$$);
	});
	this.cells[key] = this.cells.seq.concat().sort(function(a, b) {
	  return (a.v[key] > b.v[key]) ? 1 : (a.v[key] === b.v[key]) ? 0 : -1;
	});
      }
      this.current.cells = this.cells[key];
      this.current.key = key;
      this.current.direction = sortOrder.direction;
      this.redisplay(); // 'order');
      return this;
    };

    p.redisplay = function(onlyOrder) {
      var cage = this;
      var showcase = cage.showcase;
      var count = 0; 

      // TODO: 該当要素が変わらない場合は再描画しない

      // 最初に各セルが表示対象か調べるよ
      // 表示対象の場合、何番目に表示するかも決めるよ
      // これらの情報法は各セルの next オブジェクト (cell.next) に記録しておくよ

      if (! onlyOrder) {
	cage.eachCell(function(cell) {
          cell.next = {};
          var enabled = cell.next.enabled = showcase.checkEnabled(cell);
	});
      }
      var cellWidth = cage.cells.seq[0].$$.outerWidth(true);
      var cellHeight = cage.cells.seq[0].$$.outerHeight(true);
      var top = 0, left = 0, lastTop = 0;
      var i, step, n = this.current.cells.length;
      if (this.current.direction == 'asc') {
	i = 0, step = 1;
      } else {
	i = n - 1, step = -1;
      }
      while (0 <= i && i < n) {
        var cell = this.current.cells[i];
	i += step;
        var position;
        if (cell.next.enabled) {
	  count++;
          cell.redisplay({ top: top, left: left });
          left += cellWidth;
          lastTop = top;
          if (left >= showcase.width - cellWidth) {
            left = 0;
            top += cellHeight;
          }
        } else {
          cell.redisplay();
        }
      }
      cage.$$.animate({ height: count == 0 ? 0 : lastTop + cellHeight }, 1000);
      return this;
    };

    p.eachCell = function(cb) {
      this.cells.seq.forEach(cb);
      return this;
    };
    
  });

  /**
   * Choice クラス
   */
  var Choice = function(element, condition) {
    this.initAs$$(element, { parent: { condition: condition } });
  };
  as$$.call(Choice, function(p) {
    p.init = function() {
      var choice = this;
      choice.checked = false;
      choice.$$.on('click', function() {
        choice.change();
        choice.condition.prepare().redisplay();
        return false;
      });
      return this;
    };

    p.change = function(onoff) {
      if (! this.checked && onoff != 'off') {
        this.$$.addClass('on');
        this.checked = true;
      } else if (this.checked && onoff != 'on') {
        this.$$.removeClass('on');
        this.checked = false;
      }
      return this;
    };
  });

  var Condition = function(element, showcase) {
    this.initAs$$(element, { parent: { showcase: showcase } });
  };
  as$$.call(Condition, function(p) {
    p.init = function() {
      var condition = this;
      var showcase = condition.showcase;
      condition.choices = [];
      var name = condition.name = this.$$.attr('name');
      var isWhole = condition.isWhole = (name == '_');
      if (showcase.args && showcase.args.conditions && showcase.args.conditions[name]) {
        for (var key in showcase.args.conditions[name]) {
          condition[key] = showcase.args.conditions[name][key];
        }
      }
      condition.$$.find('.selectall')
        .on('click',
            isWhole 
            ? function() {
              condition.showcase.change('on').prepare().redisplay();
            }
            : function() {
              condition.change('on').prepare().redisplay();
            });
      condition.$$.find('.clear')
        .on('click',
            isWhole 
            ? function() {
              condition.showcase.change('off').prepare().redisplay();
            }
            : function() {
              condition.change('off').prepare().redisplay();
            });
      condition.$$.find('.choice').each(function(i) {
        condition.choices.push(new Choice(this, condition));
      });
      condition.length = condition.choices.length;
      condition.prepare();
      return this;
    };

    p.eachChoice = function(cb) {
      this.choices.forEach(cb);
      return this;
    };

    p.prepare = function() {
      var condition = this;
      var indexList = [];
      condition.eachChoice(function(choice, index) {
        if (choice.checked) indexList.push(index);
      });
      condition.chart = {
        indexList: indexList,
        always: (indexList.length == condition.length) ? true : (indexList.length == 0) ? 'never' : false
      };
      return this;
    };

    p.change = function(onoff) {
      this.eachChoice(function(choice) {
        choice.change(onoff);
      });
      return this;
    };

    p.redisplay = function() {
      this.showcase.redisplay();
      return this;
    };

    p.checkEnabled = function(cell) {
      if (this.chart.always === true) return true;
      if (this.chart.always === 'never') return false;
      var hint = cell.hint[this.name];
      for (var i = 0, n = this.chart.indexList.length; i < n; i++) {
        if (hint[this.chart.indexList[i]]) return true;
      }
      return false;
    };
  });

  var SortOrder = function(element, showcase) {
    this.initAs$$(element, { parent: { showcase: showcase } });
  };
  as$$.call(SortOrder, function(p) {
    p.init = function() {
      var showcase = this.showcase;
      var m;
      var name = this.name = this.$$.attr('name');
      if (this.name && (m = this.name.match(/(\w+)-(asc|desc)/))) {
	this.key = m[1];
	this.direction = m[2];
      }
      this.$$.on('click', function() {
	showcase.setSortOrder(name);
	return false;
      });
      this.getter = (function(order) {
	var selector = order.data.Selector;
	var type = order.data.Type;
	if (selector) {
	  switch(type) {
	  case 'integer':
	    return (function(selector) {
	      return function($$) { return parseInt($$.find(selector).text()); };
	    })(selector);
	  case 'size':
	    return (function(selector) {
	      return function($$) { return $$.find(selector).size(); };
	    })(selector);
	  default:
	    return (function(selector) {
	      return function($$) { return $$.find(selector).text(); };
	    })(selector);
	  }
	}
	return;
      })(this);
      this.checked = false;
      return this;
    };
    
    p.change = function(onoff) {
      if (! this.checked && onoff) {
        this.$$.addClass('on');
        this.checked = true;
      } else if (this.checked && ! onoff) {
        this.$$.removeClass('on');
        this.checked = false;
      }
      return this;
    };

    p.getGetter = function() {
      if (this.showcase.args.sortOrders &&
	  this.showcase.args.sortOrders[this.key]) {
	return this.showcase.args.sortOrders[this.key];
      }
      if (this.getter) return this.getter;
      if (this.piar && this.piar.getter) return this.piar.getter;
      return;
    };
  });

  var Showcase = function(element, args, opts) {
    this.args = args || {};
    this.opts = $.extend({}, defaults, opts);
    this._defaults = defaults;
    this._name = pluginName;
    this.initAs$$(element);
  };
  as$$.call(Showcase, function(p) {
    p.init = function() {
      var showcase = this;
      showcase.conditions = [];
      showcase.$$.find('.condition').each(function() {
        var condition = new Condition(this, showcase);
        if (condition.isWhole) {
          showcase.wholeCondition = condition;
        } else {
          showcase.conditions.push(condition);
        }
      });
      showcase.sortOrders = {};
      showcase.sortOrdersByKey = {};
      showcase.$$.find('.sortorder').each(function() {
	var sortorder = new SortOrder(this, showcase);
	showcase.sortOrders[sortorder.name] = sortorder;
	if (! showcase.sortOrdersByKey[sortorder.key]) {
	  showcase.sortOrdersByKey[sortorder.key] = {};
	}
	showcase.sortOrdersByKey[sortorder.key][sortorder.direction] = sortorder;
      });
      for (var key in showcase.sortOrdersByKey) {
	var ascOne = showcase.sortOrdersByKey[key].asc;
	var descOne = showcase.sortOrdersByKey[key].desc;
	if (ascOne && descOne) {
	  ascOne.piar = descOne;
	  descOne.piar = ascOne;
	}
      }
      showcase.cage = new Cage(showcase.$$.find('.cage'), showcase);
      showcase.recalc();
      showcase.cage.loadCellData();
      return this;
    };

    p.recalc = function() {
      this.width = this.$$.width();
      return this;
    };

    p.eachCondition = function(cb) {
      this.conditions.forEach(cb);
      return this;
    };

    p.redisplay = function() {
      this.cage.redisplay();
      return this;
    };

    p.change = function(onoff) {
      this.eachCondition(function(condition) {
        condition.change(onoff);
      });
      return this;
    };

    p.prepare = function() {
      this.eachCondition(function(condition) {
        condition.prepare();
      });
      return this;
    };

    /*
    p.makeSortedCellList = function() {
      this.cage.
    };
    */

    p.getHint4cell = function(cell) {
      var showcase = this;
      var hint = [];
      showcase.eachCondition(function(condition) {
	var name = condition.name;
        hint[name] = {};
        if (typeof condition.get == 'function' && typeof condition.check == 'function') {
          var val = condition.get(cell);
          condition.eachChoice(function(choice, index) {
            if (condition.check(choice, val)) {
              hint[name][index] = true;
            }
          });
        }
      });      return hint;
    };

    p.checkEnabled = function(cell) {
      var showcase = this;
      for (var i = 0, n = showcase.conditions.length; i < n; i++) {
        var condition = showcase.conditions[i];
        if (! condition.checkEnabled(cell)) return false;
      }
      return true;
    };

    p.setSortOrder = function(name) {
      var showcase = this;
      if (this.currentSortOrderName === name) {
	return this;
      }
      if (this.currentSortOrderName) {
	this.sortOrders[this.currentSortOrderName].change(false);
      }
      var sortOrder = this.sortOrders[name];
      sortOrder.change(true);
      this.cage.setSortOrder(sortOrder);
      this.currentSortOrderName = name;
      return this;
    };
  });

  $.fn[pluginName] = function(args, opts) {
    return this.each(function() {
      if (! $(this).data('_' + pluginName)) {
        $(this).data('_' + pluginName, new Showcase(this, args, opts));
      }
    });
  };
});
