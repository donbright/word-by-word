/*
 * Copyright (c) 2011 don bright
 * All rights reserved.  Use of this source code is governed by a BSD-style 
 * license that can be found in the LICENSE file.
 *
 * one function from
 * http://www.quirksmode.org/about/copyright.html
 * http://www.quirksmode.org/js/events_properties.html   
 */

/*
TODO

fix so it works better on chinese wikipedia and other sites, more testing.
 (currently the DOM modifications are badly screwing up the appearance of the page)

copy properly Textarea code (wikipedia edits) when making new dom tree

use language previously used if no translation available

put up google logo

make fade/fade

redeploy to actual gallery / store

v2

options for appearance / location

smooth the 'jump' at edges of screen

*/

/*
function onText(data) {
  // Only render the bar if the data is parsed into a format we recognize.
  if (data.trends) {
    var trend_names = []
    for (var date in data.trends) {
      if (data.trends.hasOwnProperty(date)) {
        var trends = data.trends[date];
        for (var i=0,trend; trend = trends[i]; i++) {
          trend_names.push(trend.name);
        }
      }
    }
*/

var mbox = null;
var savebgcolor = '';
var savefgcolor = '';

function make_mbox(){
  mbox = document.createElement('div');
  //mbox.toolow=false;
  //mbox.tooright=false;
  mbox.style.display= "block";
  mbox.style.backgroundColor = "whitesmoke";
  mbox.style.width=200;
  mbox.style.height=100;
  mbox.style.border="1px solid black";
  mbox.style.position="absolute";
  mbox.style.display="block";
  //mbox.style.left="6px";
  //mbox.style.top="5px";
  //mbox.style.borderRadius = '5px'; // standard
  //mbox.style.MozBorderRadius = '5px'; // Mozilla
  //mbox.style.WebkitBorderRadius = '5px'; // WebKit
  //mbox.style.webkit-border-radius="5px";
  mboxtext = document.createElement('div');
  mboxtext.style.display="inline";
  mboxtext.innerHTML = "";
  mboxtext.style.padding="5px";
  mbox.appendChild(mboxtext);
  document.body.appendChild(mbox);
};

function mbox_receive_translation( result ) {
  // gets called by the 'background.html' script,
  // "result" argument is result of google translation.
  //  result.translation -> translated text
  //  result.error.message -> error messages
  // alert(['translation',result]);
  if (result.error) {
    mbox.firstChild.innerHTML = "Sorry:" + result.error.message;
  } else {
    mbox.firstChild.innerHTML = result.translation;
  }
}

// http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

function showbox() {
	// show translated word when you hover over word
	if (mbox==null){
		make_mbox();
	}
	//mbox.firstChild.innerHTML=this.innerHTML;

  /*if debug {
	if (this.style.color!="green") {
		this.style.color="green";
	} else {
		this.style.color="yellow";
	}
  }*/
  savebgcolor = this.style.backgroundColor;
  savefgcolor = this.style.foregroundColor;
  this.style.backgroundColor="yellow";
  this.style.color="black";
  mbox.style.opacity = 0.85;
  mbox.style.filter = 'alpha(opacity=85)';
  movebox();

  // send a request to background.html, call mbox_receive_translation with result
  text = strip(this.innerHTML);
  request = {'action' : 'lookup_translation', 'text': text, 'from_lang':'', 'to_lang':'en' };
  callback = mbox_receive_translation;
  chrome.extension.sendRequest(request, callback);
}

function where_is_mouse(e) {
  // from http://www.quirksmode.org/js/events_properties.html
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
  return [posx, posy];
}

function movebox(){
  /* move the box to where the cursor is.
     also. if your cursor is at the edge of the screen,
     then move the box so its all on the screen, visible. 
     not running off the edges. even when the text is zoomed-in 
     or zoomed-out */
  
  // most of this code is dealing with non-standard height measurements
  // that are undocumented and not cross-browser at all. but this
  // is chrome extension so forget about it for now. 

  pos=where_is_mouse();
  mousex=pos[0];
  mousey=pos[1];
  var toolow;
  var tooright;
  var adjx=20;
  var adjy=20;

  /***** height ******/

  h1 = document.body.scrollTop + window.innerHeight;
  h2 = mousey;
  h3 = Math.abs(h2-h1);
  h4 = ( window.outerHeight - window.innerHeight ) / window.outerHeight;

  /* h4 goes from approx -0.7  (font really small) to +0.7  (font really huge)
     the diff in pixels has to be adjusted based on this. 
     when font really small, the diff can be -70
     when font really big the diff can be -30 */

  adjuster=30 + Math.abs((h4+0.7)/1.4) * 40 ;

  if ((adjuster+mbox.clientHeight)>h3) { toolow=true; } else {toolow=false;}
  if (toolow) { adjy = -mbox.clientHeight + -1*adjuster; } else { adjy = 20; };
  if ((mousex+adjy)<0) { adjx = -1 * mousey; }

  /* var debug = window.innerHeight + ',' + window.outerHeight + ',';
    debug = h1 + ':' + h2 + ':' + Math.abs(h3) + ':'; // h4 + ':'+ mbox.clientHeight;  
    debug += ' ;;; ' + adjuster + ';;;;' + diff + ','+toolow
  
  	mbox.firstChild.innerHTML=debug; */

  /***** width ******/ // (same exact calcs as for height)

  h1 = document.body.scrollLeft + window.innerWidth;
  h2 = mousex;
  h3 = Math.abs(h2-h1);
  h4 = ( window.outerHeight - window.innerHeight ) / window.outerHeight;

  adjuster=30 + Math.abs((h4+0.7)/1.4) * 40 ;

  if ((adjuster+mbox.clientWidth)>h3) { tooright=true; } else {tooright=false;}
  if (tooright) { adjx = -mbox.clientWidth + -1*adjuster; } else { adjx = 20; };
  if ((mousex+adjx)<0) { adjx = -1 * mousex; }

  /*** actual movement ***/
  mbox.style.left=mousex+adjx+'px';
  mbox.style.top=mousey+adjy+'px';
}

function hidebox(){
  // stop showing the box when mouse moves away from words
  // return; // debug
  mbox.style.opacity = 0;
  mbox.style.filter = 'alpha(opacity=0)';
  mbox.style.left = -1000;
  mbox.style.top = -1000;

  this.style.backgroundColor=savebgcolor;
  this.style.color=savefgcolor;
  mbox.firstChild.innerHTML = "";
}

function walk(node) {
  // alter tree nodes , in-place
  // document.write(node.nodeType+'<br>');
  //document.write(node.nodeName+'<br>');
  if (node.nodeName=="INPUT" || node.nodeName=="FORM" ||
      node.nodeName=="input" || node.nodeName=="form") {
    // do nothing 
  } else if (node.nodeType==document.ELEMENT_NODE) {
    // node.style.color="yellow"; // debug
    for (var i=0;i<node.childNodes.length;i++){
        child = node.childNodes.item(i);
        walk(child);
    }
  } else if (node.nodeType==document.TEXT_NODE) {
    wordsel = document.createElement('text')
    // take each word, split at the spaces, 
    // create a new element for the word,
    // then link the element to mouseover
    words = node.textContent.split(' ');
    for (var i=0; i<words.length;i++){
      var newel = document.createElement('text');
      newel.textContent = words[i].replace(" ","") + " ";
      // newel.style.color="green"; // debug
      //if (node.nodeValue.style.color==#0645AD) { newel.onmouseover = showbox;};
      newel.onclick = showbox;
      newel.onmouseout = hidebox;
      newel.onmousemove = movebox;
      wordsel.appendChild(newel);
    };
    node.parentNode.replaceChild(wordsel,node);
  } // else if (node.nodeType==COMMENT_NODE) {} // do nothing
}

function run() {
  //alert("run");
  basenode = document.body;
  newtree = basenode.cloneNode(true);
  walk(newtree);
  //basenode.appendChild(newtree);
  basenode.parentNode.replaceChild(newtree,basenode);
}

run();

