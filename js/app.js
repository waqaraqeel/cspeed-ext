'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'timer',
    'myApp.controllers',
    'ngAnimate',
    'fx.animations'
]);

$('.message .close').on('click', function() {
    $(this).closest('.message').fadeOut();
});


var tests = [
{'link': 'https://www.adcash.com/', 'name': 'adcash', 'showName': 'www.adcash.com'} ,
{'link': 'https://www.addthis.com/', 'name': 'addthis', 'showName': 'www.addthis.com'} ,
{'link': 'https://www.adf.ly/', 'name': 'adf', 'showName': 'www.adf.ly'} ,
{'link': 'https://www.adobe.com/', 'name': 'adobe', 'showName': 'www.adobe.com'} ,
{'link': 'https://www.badoo.com/', 'name': 'badoo', 'showName': 'www.badoo.com'} ,
{'link': 'http://coccoc.com/', 'name': 'coccoc', 'showName': 'coccoc.com'} ,
{'link': 'https://www.godaddy.com/', 'name': 'godaddy', 'showName': 'www.godaddy.com'} ,
{'link': 'https://www.google.com/', 'name': 'google', 'showName': 'www.google.com'} ,
{'link': 'https://www.hostgator.com/', 'name': 'hostgator', 'showName': 'www.hostgator.com'} ,
{'link': 'https://www.instagram.com/', 'name': 'instagram', 'showName': 'www.instagram.com'} ,
{'link': 'https://www.mailchimp.com/', 'name': 'mailchimp', 'showName': 'www.mailchimp.com'} ,
{'link': 'https://www.microsoft.com/', 'name': 'microsoft', 'showName': 'www.microsoft.com'} ,
{'link': 'https://www.mozilla.org/', 'name': 'mozilla', 'showName': 'www.mozilla.org'} ,
{'link': 'https://www.netflix.com', 'name': 'netflix', 'showName': 'www.netflix.com'} ,
{'link': 'https://www.outbrain.com/', 'name': 'outbrain', 'showName': 'www.outbrain.com'} ,
{'link': 'https://www.salesforce.com/', 'name': 'salesforce', 'showName': 'www.salesforce.com'} ,
{'link': 'https://www.stumbleupon.com/', 'name': 'stumbleupon', 'showName': 'www.stumbleupon.com'} ,
{'link': 'https://www.vimeo.com/', 'name': 'vimeo', 'showName': 'www.vimeo.com'} ,
{'link': 'https://www.wikipedia.org/', 'name': 'wikipedia', 'showName': 'www.wikipedia.org'} ,
{'link': 'https://www.wordpress.com/', 'name': 'wordpress', 'showName': 'www.wordpress.com'}
];

var grades = {
    'A': {
        'letter': 'A',
        'color': 'red',
        'comment': 'Pretty fast. Your browsing experience compares favorably to both users globally, and in your city.'
    },
    'A1': {
        'letter': 'A',
        'color': 'red',
        'comment': 'Pretty fast. Your browsing experience compares favorably to users globally. We have not seen tests run from any network other than yours in your city, though.'
    },
    'B': {
        'letter': 'B',
        'color': 'green',
        'comment': 'Satisfactory. You should still run the test over other networks in your area for comparison.'
    },
    'B1': {
        'letter': 'B',
        'color': 'green',
        'comment': 'Satisfactory. You should also run the test over other networks, although we have not seen typical users of other networks in your city finish the test much faster.'
    },
    'C1': {
        'letter': 'C',
        'color': 'blue',
        'comment': 'Meh. Your browsing experience is not quite fast. However, so far, we have not seen typical users of other networks in your city finish the test much faster. Try running the test over other networks.'
    },
    'C': {
        'letter': 'C',
        'color': 'blue',
        'comment': 'Meh. Your browsing experience is not quite fast. A variety of factors could be involved, but you should check if other networks in your area are faster.'
    },
    'D': {
        'letter': 'D',
        'color': 'grey',
        'comment': 'Pretty slow. Your browsing experience is quite slow. A variety of factors could be involved, but you should check if other networks in your area are faster.'
    },
    'F': {
        'letter': 'F',
        'color': 'grey',
        'comment': 'Indeterminate. too many timeouts!'
    }
}

var sisterCity = {
    "Urbana": "Champaign-Urbana",
    "Champaign": "Champaign-Urbana",
    //"Minneapolis": "Minneapolis-Saint Paul",
    //"Saint Paul": "Minneapolis-Saint Paul",
    "Dallas": "Dallas-Fort Worth",
    "Fort Worth": "Dallas-Fort Worth",
    "Bloomington": "Bloomington-Normal",
    "Normal": "Bloomington-Normal",
    "Boston": "Boston-Cambridge",
    "Cambridge": "Boston-Cambridge" // How do we differentiate this Cambridge from Cambridge, UK?
}

google.load("visualization", "1", {
    packages: ["corechart"]
});
