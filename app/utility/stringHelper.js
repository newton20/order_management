var stringformat = function(format, arguments) {
    if( arguments.length == 0 )
        return null;
    for(var i=0;i<arguments.length;i++) {
        var re = new RegExp('\\{' + (i) + '\\}','gm');
        format = format.replace(re, arguments[i]);
    }
    return format;
}

module.exports = {
    stringformat : stringformat
}