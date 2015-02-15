exports.tables = {
   oneRow: [ 
             { oID: '1', seq: '0', name: 'legolas', profession: 'archer' }
           ],
   tableTwo: [
               { oID: '1',
                 time: '' },
               { oID: '2',
                 stat: 'aoeu' },
             ]
   }

exports.streams = {
   oneRow: function () { 
               var f = function( oID, seqNum ) {
                  if( seqNum % 10 === 0 ) {
                     oID++;
                  }
                  var prof;
                  if( seqNum % 2 === 0 ) {
                     prof = 'archer';
                  } else {
                     prof = 'lover';
                  }
                  return {row: { oID: oID, seq: seqNum, name:'legolas', profession: prof },
                          next: function () { return f( oID, seqNum+1 ) },
                          delay: Math.floor( Math.random() * (8000 - 500) + 500 ) };
               };
               return f( 1, 1 ); },
   tableTwo: function() { 
                var f = function() { 
                  return { row: { oID: '1', time: (new Date()).toLocaleTimeString() },
                           next: f,
                           delay: 1000 };
                };
                return f(); }
 };
