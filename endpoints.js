module.exports = {
    TOURNAMENT: 'https://api.challonge.com/v1/tournaments',
    PARTICIPANT: ({tournamentId, participantId=""}) => {
        if(participantId === "") {
            return `https://api.challonge.com/v1/tournaments/${tournamentId}/participants.json`
        }

        return `https://api.challonge.com/v1/tournaments/${tournamentId}/participants/${participantId}.json`
    } 
}