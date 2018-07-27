const axios = require('axios');
const dotenv = require('dotenv');

const endpoints = require('./endpoints');

class BracketBuilder {
	constructor() {
		dotenv.config();

    this.API_URL = process.env.CHALLONGE_API;
    this.CHALLONGE_URL = "https://challonge.com/"
		
    this.createBracket.bind(this);
    this.fetchAllBracketInfo.bind(this);
    this.deleteBracket.bind(this);
    this.indexParticipants.bind(this);
    this.addSingleParticipant.bind(this);
    this.addBulkParticipants.bind(this);
	}

	/**
	 * Creates generic bracket
	 * @param {string} name tournament name
	 * @param {Datetime} startTime when the tournament will start
	 * @param {string} description tournament description
   * @param {int} cap player cap
   * @returns {Promise}
	 */
	createBracket({ name, cap }) {
    console.log("SERVER: ", name)
		return axios.post(this.resolveURL(), { 
			name,
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

    return axios.get(this.resolveURL(), {
      params: { state: 'all', api_key: this.API_URL, created_after: today},
    })
    .then(res => res.data)
    .then(data => data.map(({ tournament }) => {
      return {id:tournament.id, name:tournament.name, url:`${this.CHALLONGE_URL}${tournament.url}`}
    }))
    .catch(err => err);
  }

  /**
   * 
   * @param {string} id tournament id 
   */
  fetchBracketInfo({ id }) {
    return axios.get(this.resolveURL(id), {
      api_key: this.API_URL
    })
    .then(res => res.data)
    .then(data => data.map(({ tournament }) => {
      return {id:tournament.id, name:tournament.name}
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
   * @returns {Promise of participant id and name} 
   */
  indexParticipants({ id }) {
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

  /**
   * @param {string} name name displayed in bracket
   * @param {string} 
   * @return {Promise} statuscode 
   */
  addSingleParticipant({ tournamentId, name }) {
    return axios.post(endpoints.PARTICIPANT({tournamentId}), 
      { api_key: this.API_URL, name: name }, {headers: { 'Content-Type': 'application/json'}
    })
    .then(res => res.status)
    .catch(err => err);
  }

  /**
   * @param {array} participants array of participantId
   * @return {[Promise]]} statuscode
   */
  addBulkParticipants(participants) {
    const resolver =  participants.map(({tournamentId, name}) => {
      return this.addSingleParticipant({tournamentId, name})
        .then(res => res)
        .catch(err => err);
    });

    return Promise.all(resolver);
  }

  /**
   * Get match
   * @param {string} tournamentId 
   * @param {string} uid userId
   * @returns {array} of objs
   */
  getMatch({ tournamentId, participantId }) {
    const matchesForTournament = axios.get(endpoints.GETMATCH({tournamentId}), 
      {api_key: this.API_URL, participant_id: participantId}, {headers: {'Content-Type': 'application/json'}
    })
    .then(res => console.log(res))
    .catch(err => err);
    return matchesForTournament.map(({match}) => {
      return { 
        tournamentId: match.tournament_id, 
        matchId: match.match_id, 
        player1: match.player1_id,
        player2: match.player2_id
      }
    })
  }

  /**
   * 
   */
  updateMatch({ matchId, tournamentId, winnerId}) {
    return axios.put(endpoints.UPDATEMATCH({tournamentId, matchId}),
      {api_key: this.API_URL, winner_id: winnerId}, { headers: {'Content-Type': 'application/json'}
    })
    .then(res => res.status)
    .catch(err => err)
  }

  resolveURL(param="") {
    return param === "" ? `${endpoints.TOURNAMENT}.json` : `${endpoints.TOURNAMENT}/${param}.json`
  }
}

module.exports = BracketBuilder;
