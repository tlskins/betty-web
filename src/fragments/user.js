import gql from "graphql-tag";

const UserFrags = {};

UserFrags.fragments = {
  profile: gql`
    fragment Profile on User {
      id
      name
      userName
      email
      viewedProfileLast
      betsWon
      betsLost
      inProgressBetIds
      pendingYouBetIds
      pendingThemBetIds
      twitterUser {
        idStr
        screenName
        name
      }
      notifications {
        id
        sentAt
        title
        type
        message
      }
    }
  `
};

export default UserFrags;
