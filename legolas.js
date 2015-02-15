#!/usr/local/bin/node
var http = require( 'http' );
var util = require( 'util' );
var fs = require('fs');

var arrow;
if( process.argv[ 2 ] ) {
   console.log( 'opening ' + process.argv[ 2 ] + ' for arrow data' );
   arrow = require( process.argv[ 2 ] );
} else {
   arrow = require( './resp.js' );
}

function handleIncoming( req, res ) {
  var path = req.url.split( "/" ); 
  if( path[ 1 ] === '' ) {
    if( req.method === 'GET' ) {
       res.writeHead(200, {'Content-Type': 'text/html'});
       res.write(fs.readFileSync(__dirname + '/index.html'));
       res.end();
    } else if ( req.method === 'POST' ) {
      this.emit( 'err', res, 'query add not implemented' );
    } else {
      this.emit( 'err', res, req.method + ' /' );
    }
  } else if( path[ 1 ] === 'stream' ) {
    var thunk = arrow.streams[ path[ 2 ] ];
    var cont = true;
    if( thunk ) {
      res.on( 'close', function() {
        console.log( 'client left stream ' + path[ 2 ] );
        cont = false;
      } );
      res.writeHead( 200, { 'Content-Type': 'text/event-stream',
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': 'no-cache' } );
      var fn = function( stream ) {
        var tpl = stream();
        console.log( util.format( '%j', tpl.row ) );
        res.write( 'data: ' + util.format( '%j', tpl.row ) + '\n\n' );
        if( cont ) {
           setTimeout( function()  {
             fn( tpl.next );
           }, tpl.delay )
        } };
      fn( thunk );
    } else {
      this.emit( 'err', res, 'no stream thunk for ' + path[ 2 ] );
    }

  } else { // probably a table name
    var table = arrow.tables[ path[ 1 ] ];
    if( table ) {
      this.emit( 'valid', res, table );
    } else {
      this.emit( 'err', res, 'path not understood /' + path[ 1 ] );
    }
  }
}

var srv = http.createServer( handleIncoming )
              .on( 'err', function( res, msg ) {
                  console.log( msg );
                  res.writeHead( 404 )
                  res.end( msg ); } )
              .on( 'valid', function( res, msg ) {
                  res.writeHead( 200, { 'Content-Type': 'application/json',
                                        'Access-Control-Allow-Origin': '*' } );
                  res.end( util.format( '%j', msg ) ); } )
              .listen( 2222 );

