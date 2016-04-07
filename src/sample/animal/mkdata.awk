BEGIN {
    pageJson = "page.json";
    css = "animals.css";
    dataJson = "animals.json";
    i = 0;
    shapeweight[i++] = 1;
    shapeweight[i++] = 2;
    shapeweight[i++] = 2;
    shapeweight[i++] = 3;
    shapeweight[i++] = 3;
    shapeweight[i++] = 3;
    shapeweight[i++] = 3;
    shapeweight[i++] = 3;
    shapeweight[i++] = 4;
    shapeweight[i++] = 4;
    shapeweightNum = i;

    i = 0;
    COL[i++] = "palevioletred"; # "red";
    COL[i++] = "mediumseagreen"; # "green";
    COL[i++] = "sandybrown"; # "yellow";
    COL[i++] = "lightsteelblue"; # "blue";
    COL[i++] = "plum"; # "magenta";
    COL[i++] = "cadetblue"; # "cyan";
    COL[i++] = "mediumpurple"; # "purple";
    colorNum = i;

    i = 0;
    SHAPE[i] = "★"; SNAME[i++] = "star"; 
    SHAPE[i] = "●"; SNAME[i++] = "circle"; 
    SHAPE[i] = "◆"; SNAME[i++] = "square"; 
    SHAPE[i] = "▲"; SNAME[i++] = "triangle"; 
    shapeNum = i;

    for (i = 0; i < 26; i++) {
	CHR[i] = sprintf("%c", 0x61 + i);
    }
    chrNum = i;

    T = "  ";
    animalNum = 0;
}

{
    name = $1;
    animal[animalNum++] = name;
}

END {
    print "output files",css,pageJson,dataJson > "/dev/stderr";
    print "{" > pageJson;
    print T "\"sortorders\": [" > pageJson;
    print T T "\"No\", \"name\", \"size\", \"NumberOfStamps\"" > pageJson;
    print T "]," > pageJson;
    print T "\"conditions\": [" > pageJson;
    print T T "{ \"name\": \"char\", \"caption\": \"含まれる文字\"," > pageJson;
    alts = "[ ";
    for (i = 0; i < 26; i++) {
	comma = i < 26 - 1 ? ", " : " ]";
	alts = alts "\"" sprintf("%c", 0x61 + i) "\"" comma
    }
    print T T "  \"choices\": " alts " }," > pageJson;
    print T T "{ \"name\": \"shape\", \"caption\": \"形\"," > pageJson;
    alts = "[ ";
    for (i = 0; i < shapeNum; i++) {
	comma = i < shapeNum - 1 ? ", " : " ]";
	alts = alts "\"" SHAPE[i] "\"" comma
    }
    print T T "  \"choices\": " alts " }," > pageJson;
    print T T "{ \"name\": \"color\", \"caption\": \"色\"," > pageJson;
    alts = "[ ";
    for (i = 0; i < colorNum; i++) {
	comma = i < colorNum - 1 ? ", " : " ]";
	alts = alts "\"" COL[i] "\"" comma
    }
    print T T "  \"choices\": " alts " }" > pageJson;
    print T "]," > pageJson;
    print T "\"shapes\": {" > pageJson;
    for (i = 0; i < shapeNum; i++) {
	comma = i < shapeNum - 1 ? "," : "";
	print T T "\"" SNAME[i] "\": \"" SHAPE[i]"\"" comma > pageJson;
    }
    print T "}" > pageJson;
    print "}" > pageJson;

    print "{" > dataJson;
    for (i = 0; i < animalNum; i++) {
	name = animal[i];
	id = "cell_" name;
	print T "\"" name "\": {" > dataJson;
	print T T "\"name\": \"" name "\"," > dataJson;
	print T T "\"id\": \"" id "\"," > dataJson;
	print T T "\"no\": " i "," > dataJson;
	print T T "\"size\": " getSize() "," > dataJson;
	shuffle(COL);
	print T T "\"color\": \"" COL[0] "\"," > dataJson;
	print T T "\"marks\": [" > dataJson;
	marks = shapeweight[int(rand() * shapeweightNum)];
	for (j = 0; j < marks; j++) {
	    sindex = int(rand() * shapeNum);
	    if (j < marks - 1) {
		comma = ",";
	    } else {
		comma = "";
	    }
	    print T T T "{ \"shape\": \"" SNAME[sindex] "\" }" comma> dataJson;
	}
	print T T "]" > dataJson;

#	    color = COL[j];
#	    
#	    str = str "  <span class=\"" color " " SNAME[sindex] "\">" SHAPE[sindex] "</span>\n"
#	}
#	print "<div id=\"" name "\" class=\"cell\">\n" str "</div>";
#    }
	
	if (i < animalNum - 1) {
	    comma = ",";
	} else {
	    comma = "";
	}
	print T "}" comma > dataJson;
    }
    print "}" > dataJson;

    print "ul {" > css;
    print "  padding: 0px;" > css;
    print "  font-weight: bold;" > css;
    print "}" > css;
    print "div#showcase {" > css;
    print "  background: lightyellow;" > css;
    print "  border-style: solid;" > css;
    print "  border-radius: 10px;" > css;
    print "}" > css;
    print "div#showcase .conditions {" > css;
    print "  border-style: solid;" > css;
    print "}" > css;
    print "div#showcase .cage {" > css;
    print "  position: relative;" > css;
    print "}" > css;
    print "ul.condition,ul.sortorders {" > css;
    print "  display: table;" > css;
    print "  margin: 2px;" > css;
    print "}" > css;
    print "ul.sortorders {" > css;
    print "  border-radius: 6px;" > css;
    print "  border: 2px solid gray;" > css;
    print "}" > css;
    print "ul.condition li {" > css;
    print "  display: table-cell;" > css;
    print "  text-align: center;" > css;
    print "  height: 20px;" > css;
    print "  background-color: lightgrey;" > css;
    print "  /* color: dimgray; */" > css;
    print "  padding: 3px 20px;" > css;
    print "  border-radius: 10%;" > css;
    print "  border-left: 2px solid white;" > css;
    print "}" > css; 
    print "ul.sortorders>li {" > css;
    print "  vertical-align: middle;" > css;
    print "  display: table-cell;" > css;
    print "  text-align: center;" > css;
    print "  padding: 2px;" > css;
    print "  margin: 3px;" > css;
    print "  border-left: 1px solid gray;" > css;
    print "}" > css;
    print "ul.sortorders>li.caption {" > css;
    print "  padding: 2px 10px;" > css;
    print "  border: none;" > css;
    print "}" > css;
    print "ul.sortorders>li>ul {" > css;
    print "  list-style: none;" > css;
    print "}" > css;
    print "li.sortorder_pair {" > css;
    print "  display: table;" > css;
    print "  text-align: center;" > css;
    print "  width: 100%;" > css;
    print "}" > css;
    print "li.sortorder_name {" > css;
    print "}" > css;
    print "li.sortorder_pair span.sortorder {" > css;
    print "  color: black;" > css;
    print "  display: table-cell;" > css;
    print "  vertical-align: middle;" > css;
    print "  background-color: lightgrey;" > css;
    print "  padding: 3px 10px;" > css;
    print "  border-left: 1px solid white;" > css;
    print "}" > css;
    print "li.sortorder_pair span.sortorder:first-child {" > css;
    print "  border-left: none;" > css;
    print "}" > css;
    print "ul.condition li.on, ul.sortorders span.on {" > css;
    print "  color: white;" > css;
    print "  background-color: maroon;" > css;
    print "}" > css;
    print "ul.condition li.circle {" > css;
    signs[0] = "-";
    signs[1] = "";
    shadow = "";
    width = 2;
    size = 5;
    for (i in signs) {
	for (j in signs) {
	    shadow = shadow " " signs[i] width "px " signs[j] width "px " size "px white" ((i > 0 && j > 0) ? ";" : ",");
	}
    }
    print "  text-shadow: " shadow > css;
    print "}" > css;
    print "ul.condition li.char {" > css;
    print "  padding: 3px 3px;" > css;
    print "}" > css;
    print "ul.condition li.condname, ul.sortorders>li, li.sortorder_name {" > css;
    print "  color: white;" > css;
    print "  background-color: gray;" > css;
    print "}" > css;
    print "ul.condition li.condname {" > css;
    print "  border-left: none;" > css;
    print "  border-right: 4px solid white;" > css;
    print "}" > css;
    print "ul.condition li:first-child, ,ul.sortorders li:first-child {" > css;
    print "  border-left: none;" > css;
    print "}" > css;
    print "div.cell {" > css;
    print "  position: absolute;" > css;
    print "  border-radius: 15%;" > css;
    print "  margin-right: 5px;" > css;
    print "  margin-bottom: 5px;" > css;
#    print "  background-color: palegoldenrod;" > css;
    print "  border-style: double;" > css;
    print "  border-width: 3px;" > css;
    print "  border-color: darkkhaki;" > css;
    print "  width: 100px;" > css;
    print "  height: 100px;" > css;
    print "}" > css;
    print "div.cell span.mark { font-size: 25px; float: left; }" > css;
    print "div.cell h4 { margin: 8px 3px; color: maroon; }" > css;
    print "div.cell h5 { margin: 3px; color: darkred; text-align: right; }" > css;
    for (i = 0; i < colorNum; i++) {
	color = COL[i];
	print ".fg_" color " { color: " color "; }" > css;
    }
    for (i = 0; i < colorNum; i++) {
	color = COL[i];
	print ".bg_" color " { background-color: " color "; }" > css;
    }

}

function shuffle(ar, p, q, nx, tmp) {
    nx = 0;
    for (p in ar) {
	nx++; 
    }
    for (p = nx - 1; p >= 0; p--) {
	q = int(rand() * (p + 1));
	if (q == 0) {
	    q = 1;
	}
	tmp = ar[p];
	ar[p] = ar[q];
	ar[q] = tmp;
    }
}

function getSize() {
    return sprintf("%d", rand() * 30000 + 7000);
}

function mkcondition(name, caption, arr, arrlen, str) {
    str = ""
    str = str T T T "<ul class=\"condition\" name=\"" name "\">"  "\n";
    str = str T T T T "<li class=\"condname\">" caption " " \
              "<span class=\"selectall\" title=\"全選択\">■</span>" \
              "<span class=\"clear\" title=\"全解除\">□</span>" \
	      "</li>"  "\n";

    for (i = 0; i < arrlen; i++) {
	str = str T T T T T "<li class=\"choice\">" arr[i] "</li>"   "\n";
    }

    str = str T T T "</ul>";
    return str;
}
