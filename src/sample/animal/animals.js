$(function() {
  $.getJSON('page.json', function(json) {
    var $conditions = $('.conditions');
    json.conditions.forEach(function(cond) {
      var $cond =
	$('<ul class="condition" name="' + cond.name + '"></ul>')
        .append($('<li class="condname">' + cond.caption + ' </li>')
		.append($('<span class="selectall" title="全選択">■</span>').tooltip())
		.append($('<span class="clear" title="全解除">□</span>').tooltip()));
      cond.choices.forEach(function(choice) {
	if (cond.name == 'color') {
	  $cond.append($('<li class="choice circle"><span class="fg_' + choice + '">●</span></li>'));
	} else {
	  $cond.append($('<li class="choice ' + cond.name + '">' + choice + '</li>'));
	}
      });
      // $conditions.append($('<li>').append($cond));
      $conditions.append($cond);
    });
    $conditions.append($('<ul class="condition" name="_">')
		       .append($('<li class="condname">【全体】 </li>')
			       .append($('<span class="selectall" title="全選択">■</span>').tooltip())
			       .append($('<span class="clear" title="全解除">□</span>').tooltip()
				      )
			      )
		      );

    var $sortorders = $('.sortorders');
    $sortorders.append($('<li class="caption">sort</li>'));
    json.sortorders.forEach(function(order) {
      var data = '';
      switch (order) {
      case 'No':
	data = ' data-alumsc-selector=".number" data-alumsc-type="integer"';
	break;
      case 'name':
	data = ' data-alumsc-selector=".name"';
      case 'size':
	data = ' data-alumsc-selector=".size" data-alumsc-type="integer"';
	break;
      case 'NumberOfStamps':
	data = ' data-alumsc-selector="span.mark" data-alumsc-type="size"';
	break;
      }
      var ascButton =
	'<span class="sortorder" ' + 'name="' + order + '-asc' + '"' +
	data + '>&lt;</span>';
      var descButton = 
	'<span class="sortorder" ' + 'name="' + order + '-desc' + '"' +
	'>&gt;</span>';

      $('<li>')
	.append($('<ul><li class="sortorder_name">' + order + '</li></ul>')
	  .append($('<li class="sortorder_pair">' + ascButton + descButton + '</li>'))
	       ).appendTo($sortorders);
    });

    var shapes = json.shapes;
    var args = {
      cells: {
	source: 'animals.json',
	callback: function($cage, json, cb) {
	  for (var name in json) {
	    var animal = json[name];
	    var $cell = $('<div id="' + animal.id + '" class="cell bg_' + animal.color + '" data-alumsc-color="' + animal.color + '" style="display:none;"><h4 class="name">' + animal.name + '</h4><h5>No: <span class="number">' + animal.no + '</span></h5><h5>size: <span class="size">' + animal.size + '</span></h5></div>').appendTo($cage);
	    animal.marks.forEach(function(mark) {
	      $cell.append($('<span class="mark">' + shapes[mark.shape] + '</span>'));
	    });
	  }
	  cb();
	}
      },
      conditions: {
	char: {
	  get: function(cell) {
	    return cell.$$.find('h4.name').text();
	  },
	  check: function(choice, value) {
	    return value.indexOf(choice.$$.text()) > -1; 
	  }
	},
	shape: {
	  get: function(cell) {
	    return cell.$$.find('span.mark').text();
	  },
	  check: function(choice, value) {
	    return value.indexOf(choice.$$.text()) > -1; 
	  }
	},
	color: {
	  get: function(cell) {
	    return cell.$$.data('alumsc-color');
	  },
	  check: function(choice, value) {
	    return value === choice.$$.find('span').attr('class').substr(3);
	  }
	}
      }
    };
    $('#showcase').alumShowcase(args);
  });
});
