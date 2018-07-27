module.exports = {
    TOURNAMENT: 'https://api.challonge.com/v1/tournaments',
    PARTICIPANT: ({tournamentId, participantId=""}) => {
        if(participantId === "") {
            return `https://api.challonge.com/v1/tournaments/${tournamentId}/participants.json`
        }
        return `https://api.challonge.com/v1/tournaments/${tournamentId}/participants/${participantId}.json`
    },
    BULKADD: ({tournamentId}) => {
        return `https://api.challonge.com/v1/tournaments/${tournamentId}/participants/bulk_add.json`
    },
    UPDATEMATCH: ({tournamentId, matchId}) => {
        return `https://api.challonge.com/v1/tournaments/${tournamentId}/matches/${matchId}.json`
    },
    GETMATCHS: ({tournamentId}) => {
        return `https://api.challonge.com/v1/tournaments/${tournamentId}/matches.json`
    }
}