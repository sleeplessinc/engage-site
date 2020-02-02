
let fs = require( "fs" );
let path = require( "path" );

let sleepless = require( "sleepless" );

let ME = module.filename;
delete require.cache[ME];		// always reload

let shell = path.dirname( ME ) + "/shell.html";
log( "shell " + shell );

module.exports = function( req, res, next ) {
	let html = fs.readFileSync( shell, "utf8" );
	res.writeHead( 307, {
		"Location": "https://engage.sleepless.com:44300",
	});
	res.write( "" );
	res.end();
}



