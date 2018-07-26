const axios = require('axios');
const dotenv = require('dotenv');

const endpoints = require('./endpoints');

class BracketBuilder {
	constructor() {
		dotenv.config();

		this.API_URL = process.env.CHALLONGE_API;
		
    this.createBracket.bind(this);
    this.fetchAllBracketInfo.bind(this);
    this.deleteBracket.bind(this);
    this.indexParticipants.bind(this);
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
		return axios.post(this.resolveURL(), { 
			name,
			description,
      start_at: startTime,
      url: `ATLASSIAN_${name.replace(/ /g,'')}`,
      signup_cap: cap,
			api_key: this.API_URL
    }, {'Content-Type': 'application/json'})
      .then(res => res)
      .catch(err => err);
  }

  /**
   * @param since how far back in time to retrieve tournament info
   * Fetches all brackets made within the last week
   * @returns {Promise with tournament {id, name, url}} 
   */
  fetchAllBracketInfo(since=7) {
    const today = new Date();
    today.setDate(today.getDate() - since);
    console.log(this.resolveURL());
    return axios.get(this.resolveURL(), {
      params: { state: 'all', api_key: this.API_URL, created_after: today},
    })
    .then(res => res.data)
    .then(data => data.map(({ tournament }) => {
      return {id:tournament.id, name:tournament.name, url:tournament.url}
    }))
    .catch(err => err);
  }

  /**
   * 
   * @param {string} id of tournament to delete
   * @returns {int} status code (200 === success)
   */
  deleteBracket({ id }) {
    return axios.delete(this.resolveURL(id), {
      params: { api_key: this.API_URL }
    })
    .then(res => res.status)
    .catch(err => err);
  }

  /**
   * 
   * @param {string} id tournament id
   */
  indexParticipants({ id }) {
    console.log(this.resolveURL(id));
    return axios.get(this.resolveURL(id), {
      params: { api_key: this.API_URL, include_participants: 1 }
    })
    .then(res => res.data)
    .then(data => data.tournament)
    .then(({ participants }) => participants.map(({ participant }) => {
      return {id: participant.id, name: participant.name}
    }))
    .catch(err => err);
  }

  resolveURL(param="") {
    return param === "" ? `${endpoints.TOURNAMENT}.json` : `${endpoints.TOURNAMENT}/${param}.json`
  }
}

const bb = new BracketBuilder();
// bb.deleteBracket({id: "4851658"}).then(status => console.log(status)).catch(err => console.log(err));
// bb.createBracket({name: "Kiki DO YOU LOVE ME", startTime: new Date(), description: "ayo", cap: 10}).then(status => console.log(status)).catch(err => console.log(err));
// bb.fetchAllBracketInfo().then(t => console.log(t));
bb.indexParticipants({id: "4852317"});