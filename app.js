var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// This path needs to change based off our file structure
var Models = require('./models/models');
var Game = Models.Game;

// Google OAuth instantiation
var OAuth2 = google.auth.OAuth2;

// Slack bot requirements
var { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } = require('@slack/client');
// Source the token variables 
var rtm = new RtmClient(process.env.BOT_TOKEN);
var web = new WebClient(process.env.BOT_TOKEN);