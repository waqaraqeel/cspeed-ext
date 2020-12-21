'use strict';
/* Controllers */
angular.module('myApp.controllers', [])
    .controller('TimerCtrl', function($scope, $timeout, $http, $q, $filter) {
        // Your web app's Firebase configuration
      var firebaseConfig = {
        apiKey: "AIzaSyCM8IsYXs2BqY7GcDFwnyzcdIAC_1xQt18",
        authDomain: "cspeed-e24bb.firebaseapp.com",
        databaseURL: "https://cspeed-e24bb.firebaseio.com",
        projectId: "cspeed-e24bb",
        storageBucket: "cspeed-e24bb.appspot.com",
        messagingSenderId: "284305091619",
        appId: "1:284305091619:web:d3b565253108dbccaa9596"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
        var fb = firebase.database().ref();

        // var fb = new Firebase('https://speedtest.firebaseio.com/'); //firebase reference
        var index = 0; //index for test
        var user_info = {}; //user information like ip address, web browser, and date
        var entry_point = null;

        $scope.tests = tests;
        $scope.grades = grades;
        $scope.total = null; //total speed statics
        $scope.region = null; //speed statics in same region
        $scope.num_fail = 0; //number of tests time out 
        $scope.status = 'Run cSpeed to find out!';

        //load statics to total
        fb.child('total').once('value', function(dataSnapshot) {
            $scope.total = dataSnapshot.val();
            $scope.$digest();
        });

        //get user ip address and load statics to isp and region
        $http.get('http://ip-api.com/json').success(function(response) {
            //map city
            if (sisterCity[response.city]) {
                response.city = sisterCity[response.city];
            }

            var user_city = prompt('We geo-located you to ' + response.city + ', ' +
                response.region + ', ' + response.country + '. If not, please enter your location below. \n\nWe use your location to compare your results to others in the area, as well as to a hypothetical speed-of-light Internet. You can decline to refine location information by clicking "cancel".',
                response.city + ', ' + response.region + ', ' + response.country);


            user_info.ip_api = angular.copy(response);
            user_info.browser = navigator.appVersion;
            user_info.date = Date();
            user_info.windowSize = {
                height: window.outerHeight,
                width: window.outerWidth
            }
            user_info.version = chrome.app.getDetails().version;

            if (user_city == undefined || user_city == response.city + ', ' + response.region + ', ' + response.country) {
                if (user_city == undefined) {
                    invalidData();
                } else {
                    response.isDataValid = 1;
                }
                loadGeoData();
            } else {
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + user_city)
                    .success(function(data) {
                        if (data.status != "OK") {
                            invalidData();
                        } else {
                            response.isDataValid = 1;
                            var result = data.results[0];
                            var address = result.formatted_address.split(',');
                            var geometry = result.geometry.location;
                            response.city = address[0];
                            response.region = address[1];
                            response.country = address[2];
                            response.lat = geometry.lat;
                            response.lon = geometry.lng;
                            if (sisterCity[response.city]) {
                                response.city = sisterCity[response.city];
                            }
                        }

                        // If the Google Maps API returns multiple locations, we need disambiguation
                        if (data.results.length > 1) {
                            user_city = prompt('Multiple cities named ' + response.city + '; perhaps ' + response.city + ',' +
                                response.region + ',' + response.country + '? If not, please re-enter your location:',
                                response.city + ', ' + response.region + ', ' + response.country);
                            if (user_city == undefined || user_city == response.city + ', ' + response.region + ', ' + response.country) {
                                if (user_city == undefined) {
                                    invalidData();
                                } else {
                                    response.isDataValid = 1;
                                }
                                loadGeoData();
                            } else {
                                $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + user_city)
                                    .success(function(data) {
                                        if (data.results.length == 0) {
                                            invalidData();
                                        } else {
                                            response.isDataValid = 1;
                                            result = data.results[0];
                                            address = result.formatted_address.split(',');
                                            geometry = result.geometry.location;
                                            response.city = address[0];
                                            response.region = address[1];
                                            response.country = address[2];
                                            response.lat = geometry.lat;
                                            response.lon = geometry.lng;
                                            if (sisterCity[response.city]) {
                                                response.city = sisterCity[response.city];
                                            }
                                        }
                                        loadGeoData();
                                    });
                            }
                        } else {
                            loadGeoData();
                        }
                    });
            }

            function loadGeoData() {
                user_info.ip = angular.copy(response);
                $scope.user_ip = response;
                var location = [response.city, response.region, response.country].join('_');
                fb.child('region/' + location).once('value', function(dataSnapshot) {
                    $scope.region = dataSnapshot.val();
                    $scope.$digest();
                });
            };

            function invalidData() {
                response.isDataValid = 0;
                alert("Sorry, cSpeed did not understand your input; using location information from our geo-location service instead.");
            }

        }).error(function() {
            alert('Failed to launch correctly: (a) check your network connectivity; (b) try disabling other extensions; (c) try again later.')
        });

        $scope.startTest = function() {
            if ($scope.currentTest) {
                return;
            }
            var sites = '';
            for (var i = 0; i < tests.length; i++) {
                sites += '    - ' + tests[i].showName + '\n';

            }
            var result = confirm('Can we visit the following web sites to measure load time?\n\n' + sites + '\n');
            if (!result) {
                return;
            }

            index = 0;
            $scope.currentTest = $scope.tests[index];
            performance.clearResourceTimings(); //clear perfomance statics
            $scope.upData = {};
            $scope.report = {};
            $scope.finishedTest = [];
            $scope.selectedTest = null;

            $scope.$broadcast('timer-start');
            $scope.finishedTest.push($scope.currentTest);
            chrome.tabs.create({
                url: $scope.currentTest.link,
                active: false
            }, function(tab) {
                $scope.currentTest.tab = tab;
                chrome.tabs.executeScript(tab.id, {
                    file: 'js/helper.js'
                })
            });
            $scope.status = 'Test is running';
        }
        //update individual timer in real time
        $scope.$on('timer-tick', function(event, args) {
            //$scope.currentTest.time = args.millis / 1.5;
            if (args.millis < 1000) $scope.currentTest.time = 0;
            else $scope.currentTest.time = args.millis - 1000;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
            if (args.millis >= 15000) {
                $scope.num_fail += 1
                $scope.currentTest.time = 15000;
                if ($scope.currentTest.ip) {
                    var testRef = $scope.currentTest;
                    $http.get('http://ip-api.com/json/' + testRef.ip).success(function(response) {
                        var distance = distanceOnUnitSphere(response.lat, response.lon, user_info.ip.lat, user_info.ip.lon);
                        testRef.speed = 4 * distance / 299792458 * 1000;
                    });
                }

                $scope.upData[$scope.currentTest['name']] = {
                    time: {
                        status: 'timeout',
                        loadEventEnd: $scope.total[$scope.currentTest['name']],
                        navigationStart: 0
                    },
                    ip: $scope.finishedTest[index].ip
                };
                chrome.tabs.remove($scope.currentTest.tab.id);
                loadNextTest();
            }
        });

        /*
        get message including ip, timing and resource data
        when receive timing data, the current test site has been fullly loaded, and move to next test
        */
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.details) {
                $scope.currentTest.ip = request.details.ip;
                return;
            }
            
            console.log(request)
            chrome.tabs.remove(sender.tab.id);
            console.log(request);
            loadResult(index, request);
            loadNextTest();
        });

        //move to next test
        function loadNextTest() {
            index++;
            //check if the test is at the end
            if (index == $scope.tests.length) {
                $scope.$broadcast('timer-stop');
                $scope.currentTest = {
                    name: 'perf',
                    showName: 'Javascript compute test',
                    link: 'Perfomance test. Please wait.'
                };
                $scope.finishedTest.unshift($scope.currentTest);
                var bench = new Benchmark({
                        // benchmark name
                        'name': 'join test',
                        // benchmark test as a string
                        'fn': 'new Array(5e7).join(" ")'
                    })
                    .on('complete', function() {
                        $scope.currentTest.time = this.times.elapsed * 1000;
                        user_info.performance = this.times.elapsed * 1000;
                        $scope.currentTest = undefined;
                        $('#currentTest').text('Finish');
                        $scope.status = 'Run cSpeed again';
                        $scope.$digest();
                        finalizeTest();
                    });
                // Run the tests
                $timeout(function() {
                    bench.run();
                }, 100);
                return;
            }
            $scope.currentTest = $scope.tests[index];
            $scope.finishedTest.unshift($scope.currentTest);
            $scope.$broadcast('timer-start');
            chrome.tabs.create({
                url: $scope.currentTest.link,
                active: false
            }, function(tab) {
                $scope.currentTest.tab = tab;
                chrome.tabs.executeScript(tab.id, {
                    file: 'js/helper.js'
                })
            });
            $scope.$digest();
        }
        /*
        format individual test result
            para:
                index: index for test
                data: object containing timing and resource
        */
        function loadResult(index, data) {
            $scope.upData[$scope.tests[index]['name']] = {
                time: data.time,
                ip: $scope.finishedTest[index].ip
            };
            $scope.finishedTest[0].time = data.time.loadEventEnd - data.time.navigationStart;
            $scope.finishedTest[0].data = data;

            var testRef = $scope.finishedTest[0];
            $http.get('http://ip-api.com/json/' + testRef.ip).success(function(response) {
                var distance = distanceOnUnitSphere(response.lat, response.lon, user_info.ip.lat, user_info.ip.lon);
                testRef.speed = 4 * distance / 299792458 * 1000;

            });
        }

        function distanceOnUnitSphere(lat1, long1, lat2, long2) {
            var degreeToRadians = Math.PI / 180.0;

            var phi1 = (90.0 - lat1) * degreeToRadians;
            var phi2 = (90.0 - lat2) * degreeToRadians;

            var theta1 = long1 * degreeToRadians;
            var theta2 = long2 * degreeToRadians;

            var cos = (Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) + Math.cos(phi1) * Math.cos(phi2));
            var arc = Math.acos(cos);

            return arc * 6373000;
        }

        function finalizeTest() {
            //upload test timing data and user info
            $scope.upData.user_info = user_info;
            entry_point = fb.child('individuals').push(angular.copy($scope.upData));
            $http.get('http://ip-api.com/json').success(function(response) {
                //somewhere wierd code fails without this call
            });
            //retrieve previous test result from localstorage
            $scope.history = store.get('history');

            $scope.fb = {
                city: user_info.ip.city,
                region: user_info.ip.region,
                country: user_info.ip.country
            }
            $('.selection.dropdown').dropdown();

            $scope.generateReport();

            // $('.test:not(:first)').popup({
            //     content: 'Click for more info'
            // });
        }
        /**
         *generate report based on your test result and others' result
         *@param
         *  uTotal: User total loading time
         *  oTotal: Global users loading time
         *  speedOfLight: User speed of light
         */
        $scope.generateReport = function() {
            //User total loading time
            var uTotal = 0;
            //Global users loading time
            var oTotal = $scope.total.median;
            // var oTotal = 1000;
            //User speed of light 
            var speedOfLight = 0;


            var temp = [];
            angular.forEach($scope.finishedTest, function(value, key) {
                if (value.name == 'perf') {
                    return;
                }
                if (value.time != 15000) {
                    temp.push(value.time / $scope.total[value.name]);
                    // temp.push(value.time / 1000);
                }
            });
            temp.sort();
            var timeoutRatio = temp[Math.floor(temp.length / 2)];

            angular.forEach($scope.finishedTest, function(value, key) {
                if (value.name == 'perf') {
                    return;
                }
                if (value.time != 15000) {
                    uTotal += value.time;
                } else {
                    uTotal += $scope.total[value.name] * timeoutRatio;
                    // uTotal += 1000 * timeoutRatio;
                    entry_point.child([value.name, 'time', 'loadEventEnd'].join('/')).set($scope.total[value.name] * timeoutRatio);
                    // entry_point.child([value.name, 'time', 'loadEventEnd'].join('/')).set(1000 * timeoutRatio);
                }

                if (!isNaN(value.speed)) {
                    speedOfLight += value.speed;
                }
            });

            console.log(uTotal);
            entry_point.child('user_info/totaltime').set(uTotal);


            function compare(a, b) {
                var temp = (a - b) / b * 100;
                temp = Math.round(temp);
                return temp >= 0 ? {
                    key: 'more time',
                    value: temp
                } : {
                    key: "less time",
                    value: -temp
                }
            }
            var comparation = compare(uTotal, oTotal);
            $scope.report['summary'] = {
                uTotal: Math.round(uTotal) / 1000,
                oTotal: Math.round(oTotal) / 1000,
                comparation: comparation,
            }

            //draw overview graph
            var maxRange = 0;
            var data1 = [
                ['Result', 'Seconds', {
                    role: 'style'
                }, {
                    role: 'annotation'
                }]
            ];

            data1.push(['Your result', parseFloat($filter('number')(uTotal / 1000, 1)), 'blueviolet', parseFloat($filter('number')(uTotal / 1000, 1)) + "s"]);
            data1.push(['Global users', parseFloat($filter('number')(oTotal / 1000, 1)), 'lightGray', parseFloat($filter('number')(oTotal / 1000, 1)) + "s (" + $scope.total.count + ' tests)']);
            // data1.push(['Global users', parseFloat($filter('number')(oTotal / 1000, 1)), 'lightGray', parseFloat($filter('number')(oTotal / 1000, 1)) + "s (" + 1000 + ' tests)']);
            if ($scope.region) {
                data1.push([user_info.ip.city + " users", parseFloat($filter('number')($scope.region.median / 1000, 1)), 'lightGray', parseFloat($filter('number')($scope.region.median / 1000, 1)) + "s (" + $scope.region.count + " tests)"]);
            }
            data1.push(['Hypothetical speed-of-light Internet', parseFloat($filter('number')(speedOfLight / 1000, 3)), 'lightGray', parseFloat($filter('number')(speedOfLight / 1000, 3)) + 's']);

            //find max data
            for (var i = 1; i < data1.length; i++) {
                maxRange = Math.max(maxRange, data1[i][1]);
            }

            //store data into localstorage
            var temp = angular.copy($scope.history);
            if (temp == undefined) {
                temp = [];
            }
            if (temp.length == 10) {
                temp.shift();
            }
            temp.push({
                user_info: user_info,
                time: Math.round(uTotal) / 1000
            });
            store.set('history', temp);

            //draw graph of ISP in same region
            var data2 = [
                ['ISP', 'Seconds', {
                    role: 'style'
                }, {
                    role: 'annotation'
                }]
            ];

            if ($scope.region && $scope.region[user_info.ip.isp] == undefined) {
                $scope.region[user_info.ip.isp] = {
                    median: uTotal,
                    count: 1
                }
            }

            //the fastest ip in user region
            var fastest = null;
            var count = 0;
            angular.forEach($scope.region, function(value, key) {
                if (key != 'count' && key != 'median') {
                    count += 1;
                    if (fastest == null) {
                        fastest = key;
                    } else if ($scope.region[fastest].median > value.median) {
                        fastest = key;
                    }
                    data2.push([key, parseFloat($filter('number')(value.median / 1000, 1)), user_info.ip.isp == key ? 'blueviolet' : 'lightGray', parseFloat($filter('number')(value.median / 1000, 1)) + 's (' + value.count + ' tests)']);
                }
            });

            //find max data
            for (var i = 1; i < data2.length; i++) {
                maxRange = Math.max(maxRange, data2[i][1]);
            }
            maxRange = Math.ceil(maxRange);

            drawChart('chart_total', '', data1, maxRange);
            drawChart('chart_isp', '', data2, maxRange);

            //Get speed comparation value 
            if ($scope.region) {
                comparation = compare(uTotal, $scope.region.median);
            }

            var fastestComparation = compare($scope.region[fastest].median, $scope.region[user_info.ip.isp].median);
            $scope.report['region'] = {
                fastest: fastest,
                comparation: comparation,
                fastestComparation: fastestComparation,
                count: count
            }

            //Evaluate the grade for network
            var globalMedianRatio = uTotal / oTotal;
            if (fastest == null) {
                if (globalMedianRatio > 2) $scope.report.grade = 'D';
                else if (globalMedianRatio > 1.5) $scope.report.grade = 'C1';
                else if (globalMedianRatio > 0.95) $scope.report.grade = 'B1';
                else $scope.report.grade = 'A1';
            } else {
                var isUsingFastestISP = user_info.ip.isp == fastest;
                var fastestISPMedian = $scope.region[fastest].median; // use the fastest ISP in the region to compare
                var regionMedianRatio = uTotal / fastestISPMedian;

                if (isUsingFastestISP) {
                    if (globalMedianRatio > 2) $scope.report.grade = 'D';
                    else if (globalMedianRatio > 1.5) $scope.report.grade = 'C1';
                    else if (globalMedianRatio > 0.95) $scope.report.grade = 'B1';
                    else $scope.report.grade = 'A';
                } else {
                    if (regionMedianRatio > 1.5) {
                        if (globalMedianRatio > 1.5) $scope.report.grade = 'D';
                        else $scope.report.grade = 'C';
                    } else if (regionMedianRatio > 1.05 && regionMedianRatio <= 1.5) {
                        if (globalMedianRatio > 1.2) $scope.report.grade = 'C';
                        else $scope.report.grade = 'B';
                    } else {
                        if (globalMedianRatio > 1.5) $scope.report.grade = 'C';
                        else if (globalMedianRatio > 1) $scope.report.grade = 'B';
                        else $scope.report.grade = 'A';
                    }
                }
            }

            if ($scope.num_fail / $scope.tests.length > 0.5) {
                $scope.report.grade = 'F';
            }
        }

        //draw bar graph for speed comparasion 
        function drawChart(id, title, d, maxRange) {
            var data = google.visualization.arrayToDataTable(d);
            var view = new google.visualization.DataView(data);

            var options = {
                title: title,
                legend: {
                    position: 'none'
                },
                bar: {
                    groupWidth: '70%'
                },
                hAxis: {
                    baseline: 0,
                    textPosition: 'none',
                    maxValue: maxRange,
                    gridlines: {
                        color: 'transparent'
                    }
                },
                height: d.length * 40,
                width: window.outerWidth - 200 - 4 * parseInt($('.message').css('padding')),
                chartArea: {
                    top: '5%',
                    left: '35%',
                    width: '50%',
                    height: '100%'
                },
                enableInteractivity: 'false',
                tooltip: {
                    trigger: 'none'
                },
                annotations: {
                    alwaysOutside: true
                }
            };
            var chart = new google.visualization.BarChart(document.getElementById(id));
            chart.draw(view, options);
        };

        $scope.submitFeedback = function() {
            $scope.fb.network = $('input[name="network"]:checked').val();
            $scope.fb.country = $('.selection.dropdown').dropdown('get value');
            entry_point.child('user_info/feedback').set(angular.copy($scope.fb));
            $scope.formSubmitted = true;
        }

        $scope.$watch('fb.comments', function() {
            if ($scope.fb && $scope.fb.comments.length > 1000) {
                $scope.fb.comments = $scope.fb.comments.slice(0, 1000);
            }
        })

    });
