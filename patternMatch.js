#!/usr/bin/env node
var Transform = require('stream').Transform;
var util = require( "util" ).inherits;
var program = require('commander');
var fileSystem = require("fs");

function PatternMatch( pattern ) {
	if ( ! ( this instanceof PatternMatch ) ) {
	    return( new PatternMatch ( pattern ) );
	}
	Transform.call(this,{objectMode: true});
	this._pattern = pattern ;
}

//Inheriting from transform stream
util(PatternMatch, Transform);

PatternMatch.prototype._transform = function (chunk, encoding, getNextChunk){

	//Take chunk that is inputted through the stream and make it a String
    var stringChunk = chunk.toString();
    
    //String is split into an array based on the inputted pattern
    //Note: If pattern is found at the end of the array another empty index will be created
    var splitArray = stringChunk.split(this._pattern);

    //Isolate the last line of data which is the last index of splitArray
    //if the pattern is found at the end this will be empty 
    //otherwise you have the option of adding it or not in this case we wont
    this._lastLineData = splitArray.splice(splitArray.length-1,1)[0];

    //Push to stream
    this.push(splitArray);

    //Get next chunk from stream
    getNextChunk();
    

};

PatternMatch.prototype._flush = function (flushCompleted) {

	//Since we aren't using the last line we can set it to null
    this._lastLineData = null;
   
    flushCompleted();
    //Stream is complete
};

//From the commander module option lets you define arguments and accept inputs from the console
program.option('-p, --pattern <pattern>', 'Input Pattern such as . ,').parse(process.argv);
var args = program.pattern;

//Read the input file  into a read stream
var inputStream = fileSystem.createReadStream( "input-sensor.txt" );

//Pass the input stream into a PatternMatchStream
var patternMatchStream = inputStream.pipe( new PatternMatch(args));

//Read from the PatternMatchStream
patternMatchStream.on('readable', function() {
	var final;
	//Read from the stream to an array 
	while ((final = patternMatchStream.read()) !== null) {
		console.log(final);
	}
});









