// ==UserScript==
// @name        Takealot MusicBrainz Release Importer
// @namespace   lenjoubertblog.blogspot.co.uk/
// @description MusicBrainz Scraper for Takelot.com
// @icon        http://m.takealot.com/static/img/320/logo.png
// @include     http://www.takealot.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// @require     https://raw.github.com/murdos/musicbrainz-userscripts/master/lib/import_functions.js
// @version     2014.04.27(2)
// @grant       none
// ==/UserScript==

console.log('Takealot MusicBrainz Add Release Testing');

var myform = document.createElement("form");
myform.method="post";
myform.target = "blank";
myform.action = document.location.protocol + "//musicbrainz.org/release/add";
myform.acceptCharset = "UTF-8";
// Stylize our button
var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
if (document.getElementsByClassName('view-more').length)
{
btnCSS.innerHTML = ".mbBtn {background: no-repeat scroll left top #736DAB; height: 58px; border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-top: 25px; margin-right: -150px; background-color:} .mbBtn:hover {background: #DEDEDE}"
}
else
{
btnCSS.innerHTML = ".mbBtn {border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: no-repeat scroll left top #736DAB;} .mbBtn:hover {background: #DEDEDE}"
}
document.body.appendChild(btnCSS);
console.log('CSS added');
/*var mysubmit = document.createElement("input");
mysubmit.type = "submit";
mysubmit.value = "Add to MusicBrainz";
mysubmit.classList.add("mbBtn");
myform.appendChild(mysubmit);
console.log('Submit added');
var div = document.createElement("div");
div.classList.add("right");
	div.appendChild(myform);
document.getElementById('second').appendChild(div);*/



var artist = '', album = '', label = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;



var releasebarcode = "";
var releasecountry = "";
var releasedaterel = "";
var releaselanguage = "";
var releasetitle = "";


var allinfolist = document.querySelectorAll("div#second > div.details > dl > *");
for (var i = 0; i < allinfolist.length; i++) {
    var artistitemlabel = allinfolist[i];

    if (artistitemlabel.tagName == "DT") {

        var artistitem = artistitemlabel.textContent;
        //         console.log('The text selected are:' + artistitem);
        switch (artistitem) {
        case "BarCode": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releasebarcode = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releasebarcode);
            break;
        case "Country": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releasecountry = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releasecountry);
            break;
        case "Date Released": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releasedaterel = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releasedaterel);
            break;
        case "Language": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releaselanguage = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releaselanguage);
            break;
        case "Title": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releasetitle = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releasetitle);
            break;
        case "Artists": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);
            releaseartist = artistitemlabel.nextSibling.textContent.trim();
            console.log('The value is :' + releaseartist);
            break;
        case "Tracks": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);

            var alltracklist = document.querySelectorAll("div#second > div.details > dl > dd > ol:last-child > *");
                
                // Tracks
                var tracklistarray = new Array(); // create the tracklist array to use later

    //  2014.12.07 artist not in tracklist            
    //      var releaseartist = alltracklist[0].textContent.trim();
    //      console.log('The album artist:' + releaseartist);

    // changed to start at 0 and end -1
            for (var j = 0; j < alltracklist.length-1; j++) { // start at 1 to ignore 0 as it is not a track but previous ol need to change code to only iterate second ol
                                var track = new Object();
                console.log('The track number:' + j);
                var trackdetails = alltracklist[j].textContent.trim();
                console.log('The track name:' + trackdetails);
                var getridoffront = trackdetails.replace(/\[ Disc 01 Track./g, ""); //regex to change beginning of text
                var changebacktodot = getridoffront.replace(/\b\d{2}.\]./g, ""); // regex to change the remainder of text in correct MusicBrainz import format   new \b\d{2}.\]  old .\].
                console.log('The track regexed:' + changebacktodot);
              //     tracklistarray.push({'number': j,'title': changebacktodot});
            track.number = j+1;
            track.title = changebacktodot;
         //   disc.tracks.push(track);
                tracklistarray.push(track); // push the track objects into the array

            }
                console.log(tracklistarray);
            break;
        }
    }
}


//////////////////////////////////////////////////////////////////////////////

var Languages = new Array();
Languages["Afrikaans"] = "afr";



var Countries = new Array();
Countries["South Africa"] = "ZA";


// Analyze Takealot data and prepare to release object
function parseTakeAlotPage() {

    release = new Object();
    
    // Release artist credit
    release.artist_credit = new Array();
    var artist_name = releaseartist;
    release.artist_credit.push( { 'artist_name': artist_name } );

    // Release title
    release.title = releasetitle;

	// Release Barcode
    release.barcode = releasebarcode;

    // Default status is official
    release.status = 'official';
    
    // Default script type
    release.script = 'Latn';

    // Select country from array
    release.country = Countries[releasecountry];

    // Select release language from array
    release.language = Languages[releaselanguage];

        var disc = {'position': 1, 'tracks': tracklistarray }; //use the tracklist array
    release.discs = [ disc ];
    
    release.labels = [];
    
        // Release URL
    release.urls = new Array();
    release.urls.push( { 'url': window.location.href, 'link_type': 74 } ); //type 74 is purchase for download
    
        // Release date

        var releasedate = releasedaterel;
        if (typeof releasedate != "undefined" && releasedate != "") {
            var tmp = releasedate.split('-');        if (tmp[0] != "undefined" && tmp[0] != "") {
                release.year = parseInt(tmp[0], 10);
                if (tmp[1] != "undefined" && tmp[1] != "") {
                    release.month = parseInt(tmp[1], 10);
                    if (tmp[2] != "undefined" && tmp[2] != "") {
                        release.day = parseInt(tmp[2], 10);
                    }
                }
            }
        }



    console.log(release);

    return release;
}




console.log("Exited the tracklistarray");

var release2 = parseTakeAlotPage();
	console.log("Parsed the takealot release");

function setupUI(release) {

    // Form parameters
    var edit_note = 'Imported from ' + window.location.href;
	var parameters = MBReleaseImportHelper.buildFormParameters(release, edit_note);

    // Build form
    var innerHTML = MBReleaseImportHelper.buildFormHTML(parameters);

    // Append search link
    innerHTML += ' <small>(' + MBReleaseImportHelper.buildSearchLink(release) + ')</small>';

    // creating the link
    var importLink = $("<li>"+ innerHTML + "</li>");




    var div2=document.createElement("div");
    div2.setAttribute("style",";border:1px solid red;padding:10px 10px 10px 100px;");
    div2.innerHTML ="<h1> MusicBrainz</h1><br>";
    div2.innerHTML +="<b>Uploaded By:</b> Madmouse"+innerHTML+"<br>";
 
document.getElementById('second').appendChild(div2);

    console.log('Appended:' + edit_note);
 //   console.log(innerHTML);


}



console.log("About to setup the UI");
setupUI(release2);
console.log("Done - setupUI");

function add_field (name, value) {
	var field = document.createElement("input");
	field.type = "hidden";
	field.name = name;
	field.value = value;
	myform.appendChild(field);
}


//////////////////////////////////////////////////////////////////////////////


