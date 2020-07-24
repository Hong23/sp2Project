define(['jquery', 'underscore', 'backbone', 'app',
        'views/DisabledSensorView',
        'views/DiscreteSensorView',
        'views/CriticalSensorView',
        'views/NormalSensorView',
        //data
        'collection/sensors',
        //localize
        'i18n!:sensor',
        //template
        'text!templates/sensor.html',
        //plugins
        'moment',
        //'knob',
        'sparkline'
    ],

    function($, _, Backbone, app, DisabledSensorView, DiscreteSensorView, CriticalSensorView,
        NormalSensorView, SensorCollection, CommonStrings, SensorTemplate, moment) {

        var view = Backbone.View.extend({

            template: template(SensorTemplate),

            initialize: function() {

                this.collection = SensorCollection;
                this.collection.bind("add reset", this.load, this);
                this.collection.bind("loaded change", this.loaded, this);

            },

            events: {
                "click .help-link": "toggleHelp"
            },

            beforeRender: function() {

            },

            afterRender: function() {
                var that = this;
                //console.log("sensors afterRender");
                this.collection.fetch({
                    success: function(collection, resp, options) {
                        //console.log("sensors loaded");
                        that.loaded.call(that, collection);
                        // that.timer = setInterval(function() {
                        //     that.collection.fetch();
                        // }, 2500);
                    },
                    error: function() {}
                });


            },

            load: function(model, collection, xhr) {},

            /*updateSensorState: function(model, collection) {
                if (model.get('sensor_state') >= 0x02) {
                    this.insertView("#critical-sensor-content", new CriticalSensorView({
                        model: model
                    })).render();
                } else {
                    this.insertView("#normal-sensor-content", new NormalSensorView({
                        model: model
                    })).render();
                }
            },*/

            loaded: function(collection) {
                //console.log("sensors loaded");
                this.renderCriticalSensors();
                this.renderNormalSensors();
                this.renderDiscreteSensors();
                this.renderDisabledSensors();

                //for all the sensors log the reading every 2.5s upto 50 entries
                //this.collection.each(function(model) {
                //});
            },

            renderDisabledSensors: function() {

                var disabledSensors = this.collection.getDisabledSensors();

                //console.log(disabledSensors.length);
                disabledSensors.comparator = function(model){
                    /* Vic modify : use sensor_number replace name, thus sensors use sensor_numer sort. */
                    return model.get("sensor_number");
                };

                if (disabledSensors.length){
                    $("#disabled-sensor-content .info").remove();
                    $("#disabled-sensor-content").html("");
                }
                else{
                    $("#disabled-sensor-content .info").html("No disabled sensors");
                }

                $("#total-disabled").html(disabledSensors.length);
                disabledSensors.each(function(model) {
                    if ($("#disabled-sensor-" + model.get('sensor_number')).length) return;

                    this.insertView("#disabled-sensor-content", new DisabledSensorView({
                        model: model
                    })).render();

                }, this);

            },

            renderDiscreteSensors: function() {
                var discreteSensors = this.collection.getDiscreteSensors();

                //console.log(discreteSensors.pluck('name'));
                discreteSensors.comparator = function(model) {
                    /* Vic modify : use sensor_number replace name, thus sensors use sensor_numer sort. */
                    return model.get("sensor_number");
                    //return model.get('name');
                };

                discreteSensors.sort();

                if (discreteSensors.length){
                    $("#discrete-sensor-content .info").remove();
                    $("#discrete-sensor-content .table-body").show();
                }
                else{
                    $("#discrete-sensor-content .info").remove();
                    $("#discrete-sensor-content .table-body").find("tr:not(:first)").remove();
                    $("#discrete-sensor-content .table-body").hide();
                    $("#discrete-sensor-content").append("<div class='info'><i class='fa fa-info-circle'></i>"+CommonStrings.t("sensor:no_discretesensor")+"</div>");
                }

                $("#total-discrete").html(discreteSensors.length);
                discreteSensors.each(function(model) {
                    if ($("#discrete-sensor-" + model.get('sensor_number')).length) return;

                    this.insertView("#discrete-sensor-content .table-body", new DiscreteSensorView({
                        model: model
                    })).render();
                }, this);
            },

            renderNormalSensors: function() {
                var normalSensors = this.collection.getNormalSensors();

                normalSensors.comparator = function(model) {
                    /* Vic modify : use sensor_number replace name, thus sensors use sensor_numer sort. */
                    return model.get("sensor_number");
                    //return model.get('name');
                };

                normalSensors.sort();

                if (normalSensors.length){
                    $("#normal-sensor-content .info").remove();
                    $("#normal-sensor-content .table-body").show();
                }
                else{
                    $("#normal-sensor-content .info").remove();
                    $("#normal-sensor-content .table-body").find("tr:not(:first)").remove();
                    $("#normal-sensor-content .table-body").hide();
                    $("#normal-sensor-content").append("<div class='info'><i class='fa fa-info-circle'></i>"+CommonStrings.t("sensor:nonormal_thresholdsensor")+"</div>");
                }
                
                $("#total-normal").html(normalSensors.length);

                normalSensors.each(function(model) {
                    if ($("#normal-sensor-" + model.get('sensor_number')).length) return;

                    this.insertView("#normal-sensor-content .table-body", new NormalSensorView({
                        model: model
                    })).render();
                }, this);
            },

            renderCriticalSensors: function() {
                var criticalSensors = this.collection.getCriticalSensors();

                criticalSensors.comparator = function(model) {
                    /* Vic modify : use sensor_number replace name, thus sensors use sensor_numer sort. */
                    return model.get("sensor_number");
                    //return model.get('name');
                };

                criticalSensors.sort();

                //console.log(criticalSensors.length);

                if (criticalSensors.length)
                    $("#critical-sensor-content .info").remove();
                else
                    $("#critical-sensor-content").html("<div class='info col-md-12'><i class='fa fa-info-circle'></i>"+CommonStrings.t("sensor:allthreshold_sensors")+"</div>");

                $("#total-critical").html(criticalSensors.length);

                criticalSensors.each(function(model) {
                    if ($("#critical-sensor-" + model.get('sensor_number')+"-"+model.get('owner_lun')).length) return;

                    this.insertView("#critical-sensor-content", new CriticalSensorView({
                        model: model
                    })).render();
                }, this);
            },
            
            toggleHelp: function(e) { app.helpContentCheck(e, this); },

            serialize: function() {
                return {
                    locale: CommonStrings
                };
            }

        });

        return view;

    });
