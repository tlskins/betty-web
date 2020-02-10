import gql from "graphql-tag";

const BetFrags = {};

BetFrags.fragments = {
  bet: gql`
    fragment BetDetail on Bet {
      id
      createdAt
      finalizedAt
      expiresAt
      betStatus
      proposerReplyFk
      recipientReplyFk
      proposer {
        id
        name
        userName
        twitterUser {
          screenName
        }
      }
      recipient {
        id
        name
        userName
        twitterUser {
          screenName
        }
      }
      betResult {
        response
        responseFk
        decidedAt
        winner {
          name
          userName
          getName
        }
        loser {
          name
          userName
          getName
        }
      }
      equations {
        id
        operator {
          id
          name
        }
        expressions {
          ... on StaticExpression {
            id
            isLeft
            value
          }
          ... on PlayerExpression {
            id
            isLeft
            value
            player {
              id
              teamFk
              leagueId
              firstName
              lastName
              position
              updatedAt
            }
            game {
              id
              homeTeamFk
              homeTeamName
              awayTeamName
            }
            metric {
              name
              leftOnly
            }
          }
          ... on TeamExpression {
            isLeft
            value
            team {
              id
              leagueId
              fk
              name
              url
              updatedAt
              location
            }
            game {
              id
              homeTeamFk
              homeTeamName
              awayTeamName
            }
            metric {
              name
              leftOnly
            }
          }
        }
      }
    }
  `
};

export default BetFrags;
