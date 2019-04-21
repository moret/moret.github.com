// SHA-1 algorithm.

// Javascript modified by Eric H. Jung (grimholtz@yahoo.com) - Feb 04, 2005 -
// for use in passwordmaker firefox extension
// Original by Eugene Styer (eugene.Styer@eku.edu)
// Available at http://www.cs.eku.edu/faculty/styer/460/Encrypt/JS-SHA1.html


// convert a 32-bit value to a 8-char hex string
function cvt_hex( val )
{
   var str="";
   var i;
   var v;

   for( i=7; i>=0; i-- )
   {
      v = (val>>>(i*4))&0x0f;
      str += v.toString(16);
   }
   return str;
}

// return a hex value LSB first
function lsb_hex( val )
{
   var str="";
   var i;
   var vh;
   var vl;

   for( i=0; i<=6; i+=2 )
   {
      vh = (val>>>(i*4+4))&0x0f;
      vl = (val>>>(i*4))&0x0f;
      str += vh.toString(16) + vl.toString(16);
   }
   return str;
}

// rotate left circular
function rotate_left( n, s )
{
   var t4 = ( n<<s ) | (n>>>(32-s));
   return t4;
}

// calculate the hash
function hex_sha1()
{
   var msg = makeHashKeyByConcatenation();
   var blockstart;			// which block of words from the dataare we using now?
   var i, j;
   var W = new Array(80);
   // initial constants
   var H0 = 0x67452301;
   var H1 = 0xEFCDAB89;
   var H2 = 0x98BADCFE;
   var H3 = 0x10325476;
   var H4 = 0xC3D2E1F0;
   // working variables
   var A, B, C, D, E;
   var temp;

   // note current length
   var msg_len = msg.length;

   // convert to a 32-bit word array
   var word_array = new Array();
   for( i=0; i<msg_len-3; i+=4 )
   {
      // convert 4 bytes to a word
      j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
		msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
      word_array.push( j );
   }

   // handle final bits, add beginning of padding: 1 bit, then 0 bits
   switch( msg_len % 4 )
   {
      case 0:
         // text length was a multiple of 4 bytes, start padding
         i = 0x080000000;				// 4 bytes padding
         break;

      case 1:
         // one byte of text left
         i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;	// 3 bytes padding
         break;

      case 2:
         // two bytes of text left
         i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16
		| 0x08000;				// 2 bytes padding
         break;

      case 3:
         // three bytes of text left
         i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16
		| msg.charCodeAt(msg_len-1)<<8	| 0x80;	// 1 byte padding
         break;

      default:
         alert("Unexpected error while hashing.");
         return;
   }

   // handle the end of the text and beginning of the padding
   word_array.push( i );

   // pad to 448 bits (mod 512 bits) = 14 words (mod 16 words)
   while( (word_array.length % 16) != 14 )
      word_array.push( 0 );

   // add 64-bit message length (in bits)
   word_array.push( msg_len>>>29 );
   word_array.push( (msg_len<<3)&0x0ffffffff );

   // Process each 16-word block.
   for ( blockstart=0; blockstart<word_array.length; blockstart+=16 )
   {
      // create entries in W array
      for( i=0; i<16; i++ )
         W[i] = word_array[blockstart+i];
      for( i=16; i<=79; i++ )
         W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

      // copy state
      A = H0;
      B = H1;
      C = H2;
      D = H3;
      E = H4;

      // update state variables
      for( i= 0; i<=19; i++ )
      {
         temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;

         // update state
         E = D;
         D = C;
         C = rotate_left(B,30);
         B = A;
         A = temp;
      }

      for( i=20; i<=39; i++ )
      {
         temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;

         // update state
         E = D;
         D = C;
         C = rotate_left(B,30);
         B = A;
         A = temp;
      }

      for( i=40; i<=59; i++ )
      {
         temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;

         // update state
         E = D;
         D = C;
         C = rotate_left(B,30);
         B = A;
         A = temp;
      }

      for( i=60; i<=79; i++ )
      {
        temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6CA62C1D6) & 0x0ffffffff;

         // update state
         E = D;
         D = C;
         C = rotate_left(B,30);
         B = A;
         A = temp;
      }

      H0 = (H0 + A) & 0x0ffffffff;
      H1 = (H1 + B) & 0x0ffffffff;
      H2 = (H2 + C) & 0x0ffffffff;
      H3 = (H3 + D) & 0x0ffffffff;
      H4 = (H4 + E) & 0x0ffffffff;

   } // of loop on i

   return cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
}