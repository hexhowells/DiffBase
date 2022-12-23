String.prototype.escapeHTML = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};


function addTableEntry(str1, str2, tag1, tag2, lineNum) {
	if ((str1 == null) && str2 == null)
		return;

	str1 = str1.replace(/\t/g, '  ');
	str2 = str2.replace(/\t/g, '  ');
	
	var table = document.getElementById("diffarea");
	var row = table.insertRow(-1);

	var headerCell1 = document.createElement("TH");
	var cell1 = document.createElement("TD");
	var headerCell2 = document.createElement("TH");
	var cell2 = document.createElement("TD");

	headerCell1.classList.add(tag1);
	cell1.classList.add(tag1);
	headerCell2.classList.add(tag2);
	cell2.classList.add(tag2);

	headerCell1.innerHTML = lineNum;
	cell1.innerHTML = str1.escapeHTML();
	headerCell2.innerHTML = lineNum;
	cell2.innerHTML = str2.escapeHTML();
	
	row.append(headerCell1);
	row.append(cell1);
	row.append(headerCell2);
	row.append(cell2);
}


function LCS(str1, str2) {
	var m = str1.length;
	var n = str2.length;
	var matrix = Array(m+1).fill(0).map(()=>Array(n+1).fill(0));

	for (var i = 0; i < m+1; i++) {
		for (var j = 0; j < n+1; j++) {
			if ((i == 0) || (j == 0))
				matrix[i][j] = 0;
			else if (str1[i-1] == str2[j-1])
				matrix[i][j] = matrix[i-1][j-1] + 1;
			else
				matrix[i][j] = Math.max(matrix[i-1][j], matrix[i][j-1]);
		}
	}

	var index = matrix[m][n];
	var lcs = Array(index).fill("");

	var i = m;
	var j = n;

	while ((i > 0) && (j > 0)) {
		if (str1[i-1] == str2[j-1]) {
			lcs[index-1] = str1[i-1];
			i -= 1;
			j -= 1;
			index -= 1;
		}
		else if (matrix[i-1][j] > matrix[i][j-1])
			i -= 1;
		else
			j -= 1;
	}
	return lcs;
}


function updateDiff() {
	squeeze();
	document.getElementById("diffarea").innerHTML = '<tr> <td></td> <td><b>Original Text</b></td> <td></td> <td><b>New Text Diff</b></td> </tr>';

	var a = document.getElementById("codearea1").value.split('\n');
	var b = document.getElementById("codearea2").value.split('\n');

	a.push(null);
	b.push(null);

	var lcs = LCS(a, b);

	var i = 0;
	var j = 0;
	var lineNum = 0

	while ((i < a.length) || (j < b.length)) {
		if (a[i] == b[j]) {
			addTableEntry(a[i], b[j], "unchanged", "unchanged", lineNum);
			i += 1;
			j += 1;
		}
		else if (lcs.includes(a[i]) && b[j] != null) {
			addTableEntry("", b[j], "space", "added", lineNum);
			j += 1;
		}
		else if (lcs.includes(b[j])) {
			addTableEntry(a[i], "", "removed", "space", lineNum);
			i += 1;
		}
		else {
			addTableEntry(a[i], b[j], "removed", "added", lineNum);
			i += 1;
			j += 1;
		}
		lineNum += 1;
	}
}


// compresses tabs to 2 spaces in the text boxes
function squeeze() {
	var codeareas = ["codearea1", "codearea2"]

	for (let codeareaId of codeareas) {
		var box = document.getElementById(codeareaId);
		var text = document.getElementById(codeareaId).value;
		text = text.replace(/\t/g, '  ');
		box.value = text;
	}
}