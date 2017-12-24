// ==UserScript==
// @name         TagCoins Enhancement
// @version      0.1.1
// @description  Enhance your TagCoins Experience!
// @author       Ko
// @icon         https://raw.githubusercontent.com/wilcooo/TagCoins-Enhancement/master/three_coins.png
// @download     https://raw.githubusercontent.com/wilcooo/TagCoins-Enhancement/master/tce.user.js
// @match        http://tagpro.lol/*
// @match        http://tagcoins.lol/*
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @website      https://redd.it/no-post-yet
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @run-at       document-idle
// @license      MIT
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==




////////////////////////////////////////////////////////////////////////////////////////////
//     Please consinder to donate :)             Looking for the options? Scroll down!    //
////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                      //  //
// This script is free to use forever! If, however, you really want to support me,    //  //
// it will be highly valued if you donated. You can do so by changing the values      //  //
// below to what is right for you.                                                    //  //
                                                                                      //  //
// change false to true if you want to activate donation                              //  //
const DONATION_ENABLED = false;                                                        //  //
                                                                                      //  //
// How often would you like to donate?                                                //  //
// 1 means   'every time you visit tagpro.lol'                                        //  //
// 0.5 means 'half of the time you visit tagpro.lol'                                  //  //
// any other value between 0 and 1 will work too                                      //  //
// choose 0 if you want your donation to only be given once                           //  //
const DONATION_FREQUENCY = 0.7 ;                                                      //  //
                                                                                      //  //
// What amount would you like to donate at a time?                                    //  //
const DONATION_AMOUNT = 3 ;                                                           //  //
                                                                                      //  //
// What should be the 'reason' of your donation?                                      //  //
const DONATION_REASON = 'Donation for the "TagCoins Enhancement" script!';            //  //
                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////  //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////
//     ### --- OPTIONS --- ###                                                            //
////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                      //  //
// Show a notification whenever a transaction occurs.                                 //  //
// Also works when the browser window is minimized!                                   //  //
const NOTIFY_TRANSACTION = true;                                                      //  //
                                                                                      //  //
// Show a timestamp next to every transaction that happens *after* you opened         //  //
// or refreshed the page. (timestamps of earlier transactions are impossible to know) //  //
const SHOW_TIMESTAMP = true;                                                          //  //
                                                                                      //  //
// When on someones personal transactions overview page, clicking on his or her big   //  //
// black bouncing name will get you to the connected profile on a TagPro server       //  //
const LINK_PROFILE = true;                                                            //  //
                                                                                      //  //
// Show the transaction ID next to every transaction that occurred *after* you opened //  //
// or refreshed.                                                                      //  //
const SHOW_ID = true;                                                                 //  //
                                                                                      //  //
// Show the amount of coins everyone has next to their name!                          //  //
// The amount shown is the capital someone had *before* that transaction              //  //
// This can make the loading of the page slow, and uses some more data.               //  //
const SHOW_CAPITAL = true;                                                            //  //
                                                                                      //  //
const SPY_PURCHASES = true;                                                           //  //
                                                                                      //  //
const MOAR_COINS = 3;                                                                 //  //
                                                                                      //  //
// Show a notification whenever the lottery info gets updated.                        //  //
// (not yet recommended because it doesn't work well yet)                             //  //
const NOTIFY_LOTTERY = false;                                                         //  //
                                                                                      //  //
// Don't forget to save by pressing Ctrl S  (or click the save icon)                  //  // 
// Got any other recomendations? Let me know!                                         //  //
                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////  //
//                                                     ### --- END OF OPTIONS --- ###     //
////////////////////////////////////////////////////////////////////////////////////////////






//////////////////////////////////////
// SCROLL FURTHER AT YOUR OWN RISK! //
//////////////////////////////////////







console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

// The data of each transaction (of everyone) will be sent to a sheet (at tiny.cc/tagcoins)
// This way I try to get a history of TagCoins, public to anyone!
// No personal data will be send. Check this scripts code to confirm for yourself just a bit after line 264 :)
// Please don't send false data to this URL.

const DataDropURL = 'https://script.google.com/macros/s/AKfycbznkUUI6B9nPjgU9XCBSPFdYwBqNEv3fv6nQc79YrDGZOkdhfaP/exec';


// Auto Donator: only works if DONATION_ENABLED is true.
// If you fear for your TagCoins, ask a second opinion from someone who can read
// computer code to confirm that this script really doesn't steal your coins.

if (DONATION_ENABLED && window.location.pathname == '/') {

    var AlreadyDonated = GM_getValue('AlreadyDonated');

    if ( (DONATION_FREQUENCY === 0 && !AlreadyDonated) || Math.random() < DONATION_FREQUENCY ) {

        $.post("/send/tagcoins", {
            recipient: 'Ko',
            amount: DONATION_AMOUNT,
            reason: DONATION_REASON || null,
            _csrf: $("input[name=csrfToken]").val()
        }, function(res) {
            if (!res.valid) {
                showError('Error while trying to donate to Ko: '+res.errorMessage);
            }
        });

        GM_setValue('AlreadyDonated', true);
    }

}


// Increase the number of coins according to the option (lower frequency = moar coins)

emitter.frequency /= MOAR_COINS;


// Redefining the 'emitter' object, to purposefully crash the function that should add new transactions to the table

var real_emitter = emitter;
emitter = {update: function(...args){real_emitter.update(...args);},
           frequency: {valueOf: function(){throw "fakeError";}}};


// Now we can write our own event handler to add transactions to the table, but on our way :)


var es = new EventSource('/stream/updates');
es.addEventListener("transaction", function(event) {
    var data = JSON.parse(event.data);
    data.reverse().forEach(function (t) {

        // ignore ticket purchases that aren't this user (except if the SPY option is enabled)
        if (t.type === 1 && t.sender_profile_id != $("input[name=user_profile_id]").val() && SPY_PURCHASES === false) {
            return;
        }

        real_emitter.frequency /= 9;
        timeremit = setTimeout(function() {
            real_emitter.frequency *= 9;
        }, 5000);

        var notification = "";

        var tmpl = "<tr>";
        tmpl += '<td>';
        if (t.sender_profile_id) {
            tmpl += "<a class=\"sender\" href=\"/tagpro/"+t.sender_profile_id+"\">";
            tmpl += "<span class=\"flair "+ t.sender_flair;
            tmpl += "\" style=\"background-position: "+ t.sender_flair_x +"px "+ t.sender_flair_y +"px\"></span> ";
            tmpl += t.sender_name + "</a> ";

            cached_capital["/tagpro/"+t.sender_profile_id] = null;

            notification += t.sender_name + " ";
        } else {
            tmpl += "Lottery";
            notification += "Lottery ";
        }

        if (t.type === 0) {
            tmpl += "sent ";
            notification += "sent ";
        } else {
            tmpl += "paid ";
            notification += "paid ";
        }

        tmpl += "<span class=\"coins\">";

        t.coinFlairs.forEach(function(className) {
            tmpl += "<span class=\"currency "+className+"\"></span>\n";
        });

        tmpl += "</span> ";
        tmpl += "<span class=\"tgc-amount\">"+t.amount+" TGC</span> ";
        notification += t.amount + " TGC ";

        if (t.recipient_profile_id) {
            tmpl += "to ";
            tmpl += "<a class=\"recipient\" href=\"/tagpro/"+t.recipient_profile_id+"\">";
            tmpl += "<span class=\"flair "+ t.recipient_flair;
            tmpl += "\" style=\"background-position: "+ t.recipient_flair_x +"px "+ t.recipient_flair_y +"px\"></span> ";
            tmpl += t.recipient_name;
            tmpl += "</a>";

            cached_capital["/tagpro/"+t.recipient_profile_id] = null;

            notification += "to " + t.recipient_name;
        }

        if (t.type === 1) {
            tmpl += " for a lottery ticket";
            notification += " for a lottery ticket";
        }

        if (t.type === 2) {
            tmpl += " for winning lottery";
            notification += " for winning lottery";
        }

        tmpl += '<div style="float:right">';

        if (SHOW_TIMESTAMP) tmpl += new Date(t.occurred * 1000).toTimeString().substr(0,8);

        if (SHOW_ID) tmpl += ' <sup>'+ t.id + '</sup>';

        tmpl += '</div>';

        if (t.reason) {
            tmpl += "<div class=\"reason\"></div>";
        }

        tmpl += "</td>";
        tmpl += "</tr>";

        var $transaction = $(tmpl);

        if (t.reason) {
            $transaction.find(".reason").text(t.reason);
        }

        if (window.location.pathname == '/')
            $(".table").prepend($transaction);

        // Show a notification
        if (NOTIFY_TRANSACTION) GM_notification( t.reason, notification, null, window.focus );

        updateCapital();

        // The transaction is also send to a google sheet at tiny.cc/tagcoins
        $.post( DataDropURL, t );
    });
});

es.addEventListener("lottery", function(event) {
    var data = JSON.parse(event.data);

    // data tags: id, amount, ticket_price, ticket_sold, ends_at, limit_per_user
    // also: event.ends_at

    if (NOTIFY_LOTTERY) GM_notification( 'Some information about the lottery got updated. This script doesn\'t know why (yet). (see console)', 'Lottery update!?', null, window.focus );
    console.log('Lottery update!?',data);
});



if (LINK_PROFILE && window.location.pathname.includes('tagpro')) {
    var title = document.getElementsByTagName('h1')[0];
    title.onclick = function(){
        window.location.href = 'http://tagpro-orbit.koalabeast.com/profile/'+window.location.pathname.split('/')[2];
    };
    title.style.cursor = 'pointer';
}




// Fetch capital of both parties (if enabled)

var cached_capital = {};

function updateCapital() {

    if (SHOW_CAPITAL) {

        document.querySelectorAll('a.sender:not(.capital),a.recipient:not(.capital)').forEach( function(a){

            a.classList.add('capital');

            if (cached_capital[a.href]) {
                cached_capital[a.href].then( capital => a.innerHTML += ' <i style="color:goldenrod">'+capital+'</i>' );

            } else {

                cached_capital[a.href] = new Promise( function(resolve, reject) {

                    GM_xmlhttpRequest({
                        method: "GET",
                        url: a.href,
                        onload: function(response) {
                            var profile_document = new DOMParser().parseFromString(response.responseText, "text/html");

                            var capital = parseInt(profile_document.querySelector('div.text-center').innerText);

                            a.innerHTML += '<i style="color:goldenrod">'+capital+'</i>';

                            resolve(capital);
                        },
                    });
                });

            }

        });
    }

}

updateCapital();
