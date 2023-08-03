const cron = require("node-cron");
const express = require("express");
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const { COINGECKO_ID } = process.env;

let TOKEN_PRICE_DATA = {}
const orgPriceData = fs.readFileSync('db.json');
if (orgPriceData.length != 0) {
    TOKEN_PRICE_DATA = JSON.parse(orgPriceData)
}

cron.schedule("*/30 * * * * *", fetchPricesFromCoingecko); // every 30 seconds
cron.schedule("*/30 * * * * *", fetchPricesFromMunSwap); // every 30 seconds

app.listen(3100);

app.get('/', function(req, res) {
    res.json(TOKEN_PRICE_DATA);
})

function processData(data) {
    TOKEN_PRICE_DATA = {
        ...TOKEN_PRICE_DATA,
        ...data
    }
    fs.writeFileSync('db.json', JSON.stringify(TOKEN_PRICE_DATA));
}

function fetchPricesFromCoingecko() {
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_ID}&vs_currencies=usd`).then(resp => {
        const { data } = resp
        processData(data)
    }).catch(function(error) {
    });
}

function fetchPricesFromMunSwap() {
    axios.get(`https://swap.mun.money/api/price/mun-dgm`).then(resp => {
        const { data } = resp
        processData(data)
    }).catch(err => {});

    axios.get(`https://swap.mun.money/api/price/mun-network`).then(resp => {
        const { data } = resp
        processData(data)
    }).catch(err => {});
}