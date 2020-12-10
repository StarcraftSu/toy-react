var marked = require('marked');
var fs = require('fs');
var path = require("path");

function url(str){
   return path.resolve(__dirname, str) 
}

var note = fs.readFileSync(url('note.md'), 'utf-8');
var markdownNote = marked(note);

fs.writeFileSync(url('note.html'), markdownNote);