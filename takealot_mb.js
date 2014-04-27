// ==UserScript==
// @name        Takealot MusicBrainz Release Importer
// @namespace   lenjoubertblog.blogspot.co.uk/
// @description MusicBrainz Scraper for Takelot.com
// @icon        http://m.takealot.com/static/img/320/logo.png
// @include     http://www.takealot.com/music/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js
// @require     https://raw.github.com/murdos/musicbrainz-userscripts/master/lib/import_functions.js
// @version     2014.04.27(2)
// @grant       none
// ==/UserScript==

console.log('Takealot MusicBrainz Add Release Testing');

$(document).ready(function() {

    if (window.location.href.match(/takealot\.com\/music\//) ) {
        var release = parseTakeAlotPage();
     //   setupUI(release);
       insertLink(release); 
    }

});

function setupUI(release) {

    // Form parameters
    var edit_note = 'Imported from ' + window.location.href;
    var parameters = MBReleaseImportHelper.buildFormParameters(release, edit_note);

    // Build form
    var innerHTML = MBReleaseImportHelper.buildFormHTML(parameters);

    // Append search link
    innerHTML += ' <small>(' + MBReleaseImportHelper.buildSearchLink(release) + ')</small>';

    var importLink = $("<li>"+ innerHTML + "</li>");
   
    var inputFoo2 = document.getElementById('second'); //to get the correct place to add the button on takealot.com
inputFoo2.parentNode.insertBefore(importLink, inputFoo2);
    
    importLink.appendTo("#menu ul");

                console.log('Appended:' + edit_note);
}


// Insert links in Discogs page
function insertLink(release) {

    var mbUI = $('<div class="section musicbrainz"><h3>MusicBrainz</h3></div>');

    var mbContentBlock = $('<div class="section musicbrainz"></div>');
    mbUI.append(mbContentBlock);

    // Form parameters
     var edit_note = 'Imported from ' + window.location.href;
    var parameters = MBReleaseImportHelper.buildFormParameters(release, edit_note);

    // Build form
    var innerHTML = "MusicBrainz release(s) linked to this release: <span></span><br /><br />";
    innerHTML += MBReleaseImportHelper.buildFormHTML(parameters);
    // Append search link
    innerHTML += ' <small>(' + MBReleaseImportHelper.buildSearchLink(release) + ')</small>';

    mbContentBlock.html(innerHTML);
    var prevNode = $("div.actions");
    prevNode.before(mbUI);

    // Find MB release(s) linked to this Discogs release
 //   var mbLinkContainer = $("div.section.musicbrainz div.section_content span");
//    searchAndDisplayMbLink(magnifyLink(window.location.href), 'release', mbLinkContainer);
}






var releasebarcode = "";
var releasecountry = "";
var releasedaterel = "";
var releaselanguage = "";
var releasetitle = "";

var input = document.createElement("input");
input.type = "button";
input.value = "Add to MusicBrainz";
input.onclick = showAlert;
var inputFoo = document.getElementById('second'); //to get the correct place to add the button on takealot.com
inputFoo.parentNode.insertBefore(input, inputFoo);

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

        case "Tracks": // use these cases to select the spesific text values
            console.log('The label chosen is :' + artistitem);

            var alltracklist = document.querySelectorAll("div#second > div.details > dl > dd > ol:last-child > *");
                
                // Tracks
                var tracklistarray = new Array(); // create the tracklist array to use later
        //        var track = new Object();
                
                var releaseartist = alltracklist[0].textContent.trim();
                                console.log('The album artist:' + releaseartist);
            for (var j = 1; j < alltracklist.length; j++) { // start at 1 to ignore 0 as it is not a track but previous ol need to change code to only iterate second ol
                                var track = new Object();
                console.log('The track number:' + j);
                var trackdetails = alltracklist[j].textContent.trim();
                console.log('The track name:' + trackdetails);
                var getridoffront = trackdetails.replace(/\[ Disc 01 Track./g, ""); //regex to change beginning of text
                var changebacktodot = getridoffront.replace(/\b\d{2}.\]./g, ""); // regex to change the remainder of text in correct MusicBrainz import format   new \b\d{2}.\]  old .\].
                console.log('The track regexed:' + changebacktodot);
              //     tracklistarray.push({'number': j,'title': changebacktodot});
            track.number = j;
            track.title = changebacktodot;
         //   disc.tracks.push(track);
                tracklistarray.push(track); // push the track objects into the array

            }
                console.log(tracklistarray);
            break;
        }
    }
}

function showAlert() {
    //    alert('Hello World: ' + barcodenode.innerHTML + '..tada');
    //    alert('MB Info >> ' + barcodenode + ':' + countrynode + ':' + datenode + ':' + labelnode + ':' + languagenode);
    //    alert('Track Info >> ' + trackcountnode + ':' + trackonenode + ':' + getridoffront + ':' + changebacktodot + ':' + languagenode);
    alert('BarCode: ' + releasebarcode);
}

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
    
        // Other hard-coded info
//    release.language = 'afr';  // need to do a language array lookup like is discogs
    
    release.script = 'Latn';
          release.country = Countries[ releasecountry ];
    
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

var Languages = new Array();
Languages["Afrikaans"] = "afr";



var Countries = new Array();
Countries["Afghanistan"] = "AF";
Countries["Albania"] = "AL";
Countries["Algeria"] = "DZ";
Countries["American Samoa"] = "AS";
Countries["Andorra"] = "AD";
Countries["Angola"] = "AO";
Countries["Anguilla"] = "AI";
Countries["Antarctica"] = "AQ";
Countries["Antigua and Barbuda"] = "AG";
Countries["Argentina"] = "AR";
Countries["Armenia"] = "AM";
Countries["Aruba"] = "AW";
Countries["Australia"] = "AU";
Countries["Austria"] = "AT";
Countries["Azerbaijan"] = "AZ";
Countries["Bahamas"] = "BS";
Countries["Bahrain"] = "BH";
Countries["Bangladesh"] = "BD";
Countries["Barbados"] = "BB";
Countries["Belarus"] = "BY";
Countries["Belgium"] = "BE";
Countries["Belize"] = "BZ";
Countries["Benin"] = "BJ";
Countries["Bermuda"] = "BM";
Countries["Bhutan"] = "BT";
Countries["Bolivia"] = "BO";
Countries["Croatia"] = "HR";
Countries["Botswana"] = "BW";
Countries["Bouvet Island"] = "BV";
Countries["Brazil"] = "BR";
Countries["British Indian Ocean Territory"] = "IO";
Countries["Brunei Darussalam"] = "BN";
Countries["Bulgaria"] = "BG";
Countries["Burkina Faso"] = "BF";
Countries["Burundi"] = "BI";
Countries["Cambodia"] = "KH";
Countries["Cameroon"] = "CM";
Countries["Canada"] = "CA";
Countries["Cape Verde"] = "CV";
Countries["Cayman Islands"] = "KY";
Countries["Central African Republic"] = "CF";
Countries["Chad"] = "TD";
Countries["Chile"] = "CL";
Countries["China"] = "CN";
Countries["Christmas Island"] = "CX";
Countries["Cocos (Keeling) Islands"] = "CC";
Countries["Colombia"] = "CO";
Countries["Comoros"] = "KM";
Countries["Congo"] = "CG";
Countries["Cook Islands"] = "CK";
Countries["Costa Rica"] = "CR";
Countries["Virgin Islands, British"] = "VG";
Countries["Cuba"] = "CU";
Countries["Cyprus"] = "CY";
Countries["Czech Republic"] = "CZ";
Countries["Denmark"] = "DK";
Countries["Djibouti"] = "DJ";
Countries["Dominica"] = "DM";
Countries["Dominican Republic"] = "DO";
Countries["Ecuador"] = "EC";
Countries["Egypt"] = "EG";
Countries["El Salvador"] = "SV";
Countries["Equatorial Guinea"] = "GQ";
Countries["Eritrea"] = "ER";
Countries["Estonia"] = "EE";
Countries["Ethiopia"] = "ET";
Countries["Falkland Islands (Malvinas)"] = "FK";
Countries["Faroe Islands"] = "FO";
Countries["Fiji"] = "FJ";
Countries["Finland"] = "FI";
Countries["France"] = "FR";
Countries["French Guiana"] = "GF";
Countries["French Polynesia"] = "PF";
Countries["French Southern Territories"] = "TF";
Countries["Gabon"] = "GA";
Countries["Gambia"] = "GM";
Countries["Georgia"] = "GE";
Countries["Germany"] = "DE";
Countries["Ghana"] = "GH";
Countries["Gibraltar"] = "GI";
Countries["Greece"] = "GR";
Countries["Greenland"] = "GL";
Countries["Grenada"] = "GD";
Countries["Guadeloupe"] = "GP";
Countries["Guam"] = "GU";
Countries["Guatemala"] = "GT";
Countries["Guinea"] = "GN";
Countries["Guinea-Bissau"] = "GW";
Countries["Guyana"] = "GY";
Countries["Haiti"] = "HT";
Countries["Virgin Islands, U.S."] = "VI";
Countries["Honduras"] = "HN";
Countries["Hong Kong"] = "HK";
Countries["Hungary"] = "HU";
Countries["Iceland"] = "IS";
Countries["India"] = "IN";
Countries["Indonesia"] = "ID";
Countries["Wallis and Futuna"] = "WF";
Countries["Iraq"] = "IQ";
Countries["Ireland"] = "IE";
Countries["Israel"] = "IL";
Countries["Italy"] = "IT";
Countries["Jamaica"] = "JM";
Countries["Japan"] = "JP";
Countries["Jordan"] = "JO";
Countries["Kazakhstan"] = "KZ";
Countries["Kenya"] = "KE";
Countries["Kiribati"] = "KI";
Countries["Kuwait"] = "KW";
Countries["Kyrgyzstan"] = "KG";
Countries["Lao People's Democratic Republic"] = "LA";
Countries["Latvia"] = "LV";
Countries["Lebanon"] = "LB";
Countries["Lesotho"] = "LS";
Countries["Liberia"] = "LR";
Countries["Libyan Arab Jamahiriya"] = "LY";
Countries["Liechtenstein"] = "LI";
Countries["Lithuania"] = "LT";
Countries["Luxembourg"] = "LU";
Countries["Montserrat"] = "MS";
Countries["Macedonia, The Former Yugoslav Republic of"] = "MK";
Countries["Madagascar"] = "MG";
Countries["Malawi"] = "MW";
Countries["Malaysia"] = "MY";
Countries["Maldives"] = "MV";
Countries["Mali"] = "ML";
Countries["Malta"] = "MT";
Countries["Marshall Islands"] = "MH";
Countries["Martinique"] = "MQ";
Countries["Mauritania"] = "MR";
Countries["Mauritius"] = "MU";
Countries["Mayotte"] = "YT";
Countries["Mexico"] = "MX";
Countries["Micronesia, Federated States of"] = "FM";
Countries["Morocco"] = "MA";
Countries["Monaco"] = "MC";
Countries["Mongolia"] = "MN";
Countries["Mozambique"] = "MZ";
Countries["Myanmar"] = "MM";
Countries["Namibia"] = "NA";
Countries["Nauru"] = "NR";
Countries["Nepal"] = "NP";
Countries["Netherlands"] = "NL";
Countries["Netherlands Antilles"] = "AN";
Countries["New Caledonia"] = "NC";
Countries["New Zealand"] = "NZ";
Countries["Nicaragua"] = "NI";
Countries["Niger"] = "NE";
Countries["Nigeria"] = "NG";
Countries["Niue"] = "NU";
Countries["Norfolk Island"] = "NF";
Countries["Northern Mariana Islands"] = "MP";
Countries["Norway"] = "NO";
Countries["Oman"] = "OM";
Countries["Pakistan"] = "PK";
Countries["Palau"] = "PW";
Countries["Panama"] = "PA";
Countries["Papua New Guinea"] = "PG";
Countries["Paraguay"] = "PY";
Countries["Peru"] = "PE";
Countries["Philippines"] = "PH";
Countries["Pitcairn"] = "PN";
Countries["Poland"] = "PL";
Countries["Portugal"] = "PT";
Countries["Puerto Rico"] = "PR";
Countries["Qatar"] = "QA";
Countries["Reunion"] = "RE";
Countries["Romania"] = "RO";
Countries["Russian Federation"] = "RU";
Countries["Russia"] = "RU";
Countries["Rwanda"] = "RW";
Countries["Saint Kitts and Nevis"] = "KN";
Countries["Saint Lucia"] = "LC";
Countries["Saint Vincent and The Grenadines"] = "VC";
Countries["Samoa"] = "WS";
Countries["San Marino"] = "SM";
Countries["Sao Tome and Principe"] = "ST";
Countries["Saudi Arabia"] = "SA";
Countries["Senegal"] = "SN";
Countries["Seychelles"] = "SC";
Countries["Sierra Leone"] = "SL";
Countries["Singapore"] = "SG";
Countries["Slovenia"] = "SI";
Countries["Solomon Islands"] = "SB";
Countries["Somalia"] = "SO";
Countries["South Africa"] = "ZA";
Countries["Spain"] = "ES";
Countries["Sri Lanka"] = "LK";
Countries["Sudan"] = "SD";
Countries["Suriname"] = "SR";
Countries["Swaziland"] = "SZ";
Countries["Sweden"] = "SE";
Countries["Switzerland"] = "CH";
Countries["Syrian Arab Republic"] = "SY";
Countries["Tajikistan"] = "TJ";
Countries["Tanzania, United Republic of"] = "TZ";
Countries["Thailand"] = "TH";
Countries["Togo"] = "TG";
Countries["Tokelau"] = "TK";
Countries["Tonga"] = "TO";
Countries["Trinidad and Tobago"] = "TT";
Countries["Tunisia"] = "TN";
Countries["Turkey"] = "TR";
Countries["Turkmenistan"] = "TM";
Countries["Turks and Caicos Islands"] = "TC";
Countries["Tuvalu"] = "TV";
Countries["Uganda"] = "UG";
Countries["Ukraine"] = "UA";
Countries["United Arab Emirates"] = "AE";
Countries["UK"] = "GB";
Countries["US"] = "US";
Countries["United States Minor Outlying Islands"] = "UM";
Countries["Uruguay"] = "UY";
Countries["Uzbekistan"] = "UZ";
Countries["Vanuatu"] = "VU";
Countries["Vatican City State (Holy See)"] = "VA";
Countries["Venezuela"] = "VE";
Countries["Viet Nam"] = "VN";
Countries["Western Sahara"] = "EH";
Countries["Yemen"] = "YE";
Countries["Zambia"] = "ZM";
Countries["Zimbabwe"] = "ZW";
Countries["Taiwan"] = "TW";
Countries["[Worldwide]"] = "XW";
Countries["Europe"] = "XE";
Countries["Soviet Union (historical, 1922-1991)"] = "SU";
Countries["East Germany (historical, 1949-1990)"] = "XG";
Countries["Czechoslovakia (historical, 1918-1992)"] = "XC";
Countries["Congo, The Democratic Republic of the"] = "CD";
Countries["Slovakia"] = "SK";
Countries["Bosnia and Herzegovina"] = "BA";
Countries["Korea (North), Democratic People's Republic of"] = "KP";
Countries["North Korea"] = "KP";
Countries["Korea (South), Republic of"] = "KR";
Countries["South Korea"] = "KR";
Countries["Montenegro"] = "ME";
Countries["South Georgia and the South Sandwich Islands"] = "GS";
Countries["Palestinian Territory"] = "PS";
Countries["Macao"] = "MO";
Countries["Timor-Leste"] = "TL";
Countries["<85>land Islands"] = "AX";
Countries["Guernsey"] = "GG";
Countries["Isle of Man"] = "IM";
Countries["Jersey"] = "JE";
Countries["Serbia"] = "RS";
Countries["Saint Barthélemy"] = "BL";
Countries["Saint Martin"] = "MF";
Countries["Moldova"] = "MD";
Countries["Yugoslavia (historical, 1918-2003)"] = "YU";
Countries["Serbia and Montenegro (historical, 2003-2006)"] = "CS";
Countries["Côte d'Ivoire"] = "CI";
Countries["Heard Island and McDonald Islands"] = "HM";
Countries["Iran, Islamic Republic of"] = "IR";
Countries["Saint Pierre and Miquelon"] = "PM";
Countries["Saint Helena"] = "SH";
Countries["Svalbard and Jan Mayen"] = "SJ";
