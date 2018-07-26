const axios = require('axios');
const dotenv = require('dotenv');
const queryString = require('query-string');

const endpoints = require('./endpoints');

class BracketBuilder {
	constructor() {
		dotenv.config();

		this.API_URL = process.env.CHALLONGE_API;
		
    this.createBracket.bind(this);
    this.fetchAllBracketInfo.bind(this);
	}

	/**
	 * Creates generic bracket
	 * @param {string} name tournament name
	 * @param {Datetime} startTime when the tournament will start
	 * @param {string} description tournament description
   * @param {int} cap player cap
   * @returns {Promise}
	 */
	createBracket({ name, startTime, description, cap }) {
		return axios.post(endpoints.TOURNAMENT, { 
			name,
			description,
      start_at: startTime,
      url: `ATLASSIAN_${name.replace(/ /g,'')}`,
      signup_cap: cap,
			api_key: this.API_URL
    }, {'Content-Type': 'application/json'})
  }

  /**
   * Fetches all brackets made within the last week
   * @returns {Promise}
   */
  fetchAllBracketInfo(since=7) {
    const today = new Date();
    today.setDate(today.getDate() - since);

    const qs = queryString.stringify({state: 'all', api_key: this.API_URL})
    console.log(`${endpoints.TOURNAMENT}?${qs}`)
    return axios.get(`${this.API_URL}?${qs}`, {'Content-Type': 'application/json'}).then(res => res).catch(err => err);
  }
}

const bb = new BracketBuilder();
// bb.createBracket({name: "Ayo I like mayo123443365", startTime: new Date(), description: "ayo", cap: 10}).then(status => console.log(status)).catch(err => console.log(err));
bb.fetchAllBracketInfo().then(res => console.log(res));