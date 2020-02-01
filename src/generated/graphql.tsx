import gql from 'graphql-tag';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Timestamp: any,
  BetStatus: any,
};

export type Bet = {
   __typename?: 'Bet',
  id: Scalars['ID'],
  createdAt?: Maybe<Scalars['Timestamp']>,
  sourceFk: Scalars['String'],
  proposer?: Maybe<IndexUser>,
  recipient?: Maybe<IndexUser>,
  acceptFk?: Maybe<Scalars['String']>,
  proposerReplyFk?: Maybe<Scalars['String']>,
  recipientReplyFk?: Maybe<Scalars['String']>,
  expiresAt?: Maybe<Scalars['Timestamp']>,
  finalizedAt?: Maybe<Scalars['Timestamp']>,
  equations: Array<Maybe<Equation>>,
  betStatus?: Maybe<Scalars['BetStatus']>,
  betResult?: Maybe<BetResult>,
};

export type BetMap = {
   __typename?: 'BetMap',
  id: Scalars['Int'],
  name: Scalars['String'],
};

export type BetRecipient = {
  userId?: Maybe<Scalars['String']>,
  twitterScreenName?: Maybe<Scalars['String']>,
};

export type BetResult = {
   __typename?: 'BetResult',
  winner: IndexUser,
  loser: IndexUser,
  response: Scalars['String'],
  responseFk?: Maybe<Scalars['String']>,
  decidedAt: Scalars['Timestamp'],
};


export type Equation = {
   __typename?: 'Equation',
  id: Scalars['Int'],
  expressions: Array<Maybe<Expression>>,
  operator?: Maybe<BetMap>,
  result?: Maybe<Scalars['Boolean']>,
};

export type Expression = {
  id: Scalars['Int'],
  isLeft: Scalars['Boolean'],
  value?: Maybe<Scalars['Float']>,
};

export type ExpressionUnion = StaticExpression | PlayerExpression | TeamExpression;

export type Game = {
   __typename?: 'Game',
  id: Scalars['ID'],
  leagueId: Scalars['String'],
  name: Scalars['String'],
  fk?: Maybe<Scalars['String']>,
  url?: Maybe<Scalars['String']>,
  awayTeamFk?: Maybe<Scalars['String']>,
  awayTeamName?: Maybe<Scalars['String']>,
  homeTeamFk?: Maybe<Scalars['String']>,
  homeTeamName?: Maybe<Scalars['String']>,
  gameTime?: Maybe<Scalars['Timestamp']>,
  gameResultsAt?: Maybe<Scalars['Timestamp']>,
  final?: Maybe<Scalars['Boolean']>,
  week?: Maybe<Scalars['Int']>,
  year?: Maybe<Scalars['Int']>,
};

export type IndexUser = {
   __typename?: 'IndexUser',
  id: Scalars['ID'],
  name?: Maybe<Scalars['String']>,
  userName: Scalars['String'],
  twitterUser?: Maybe<TwitterUser>,
};

export type LeagueSettings = {
   __typename?: 'LeagueSettings',
  id: Scalars['String'],
  currentYear: Scalars['Int'],
  currentWeek: Scalars['Int'],
  playerBets: Array<Maybe<BetMap>>,
  teamBets: Array<Maybe<BetMap>>,
  betEquations: Array<Maybe<BetMap>>,
};

export type Mutation = {
   __typename?: 'Mutation',
  signOut: Scalars['Boolean'],
  viewProfile: User,
  updateUser: User,
  createBet?: Maybe<Bet>,
  acceptBet: Scalars['Boolean'],
  postRotoArticle: Scalars['Boolean'],
};


export type MutationViewProfileArgs = {
  sync: Scalars['Boolean']
};


export type MutationUpdateUserArgs = {
  changes: ProfileChanges
};


export type MutationCreateBetArgs = {
  changes: NewBet
};


export type MutationAcceptBetArgs = {
  id: Scalars['ID'],
  accept: Scalars['Boolean']
};

export type NewBet = {
  betRecipient: BetRecipient,
  newEquations: Array<Maybe<NewEquation>>,
};

export type NewEquation = {
  operatorId?: Maybe<Scalars['Int']>,
  newExpressions: Array<Maybe<NewExpression>>,
};

export type NewExpression = {
  id: Scalars['Int'],
  type: Scalars['String'],
  isLeft: Scalars['Boolean'],
  playerId?: Maybe<Scalars['String']>,
  gameId?: Maybe<Scalars['String']>,
  teamId?: Maybe<Scalars['String']>,
  metricId?: Maybe<Scalars['Int']>,
  value?: Maybe<Scalars['Float']>,
};

export type Notification = {
   __typename?: 'Notification',
  id?: Maybe<Scalars['ID']>,
  sentAt: Scalars['Timestamp'],
  title: Scalars['String'],
  type: Scalars['String'],
  message?: Maybe<Scalars['String']>,
};

export type Player = Subject & {
   __typename?: 'Player',
  id: Scalars['ID'],
  leagueId: Scalars['String'],
  fk: Scalars['String'],
  name: Scalars['String'],
  url: Scalars['String'],
  updatedAt?: Maybe<Scalars['Timestamp']>,
  game?: Maybe<Game>,
  firstName: Scalars['String'],
  lastName: Scalars['String'],
  teamFk?: Maybe<Scalars['String']>,
  teamName?: Maybe<Scalars['String']>,
  teamShort?: Maybe<Scalars['String']>,
  position?: Maybe<Scalars['String']>,
};

export type PlayerExpression = Expression & {
   __typename?: 'PlayerExpression',
  id: Scalars['Int'],
  isLeft: Scalars['Boolean'],
  player?: Maybe<Player>,
  game?: Maybe<Game>,
  value?: Maybe<Scalars['Float']>,
  metric?: Maybe<BetMap>,
};

export type ProfileChanges = {
  name?: Maybe<Scalars['String']>,
  userName?: Maybe<Scalars['String']>,
  password?: Maybe<Scalars['String']>,
};

export type Query = {
   __typename?: 'Query',
  signIn: User,
  leagueSettings: LeagueSettings,
  currentBets: Array<Bet>,
  bets: Array<Bet>,
  bet?: Maybe<Bet>,
  currentRotoArticles: Array<Maybe<RotoArticle>>,
  currentGames?: Maybe<Array<Maybe<Game>>>,
  findGames: Array<Maybe<Game>>,
  findPlayers: Array<Maybe<Player>>,
  findUsers: Array<Maybe<User>>,
  searchSubjects: Array<Maybe<SubjectUnion>>,
};


export type QuerySignInArgs = {
  userName: Scalars['String'],
  password: Scalars['String']
};


export type QueryLeagueSettingsArgs = {
  id: Scalars['String']
};


export type QueryBetArgs = {
  id: Scalars['ID']
};


export type QueryCurrentRotoArticlesArgs = {
  id: Scalars['String']
};


export type QueryFindGamesArgs = {
  team?: Maybe<Scalars['String']>,
  gameTime?: Maybe<Scalars['Timestamp']>,
  week?: Maybe<Scalars['Int']>,
  year?: Maybe<Scalars['Int']>
};


export type QueryFindPlayersArgs = {
  name?: Maybe<Scalars['String']>,
  team?: Maybe<Scalars['String']>,
  position?: Maybe<Scalars['String']>
};


export type QueryFindUsersArgs = {
  search: Scalars['String']
};


export type QuerySearchSubjectsArgs = {
  search: Scalars['String']
};

export type RotoArticle = {
   __typename?: 'RotoArticle',
  id: Scalars['ID'],
  imgSrc?: Maybe<Scalars['String']>,
  playerName: Scalars['String'],
  position?: Maybe<Scalars['String']>,
  team?: Maybe<Scalars['String']>,
  title: Scalars['String'],
  article: Scalars['String'],
  scrapedAt?: Maybe<Scalars['Timestamp']>,
};

export type StaticExpression = Expression & {
   __typename?: 'StaticExpression',
  id: Scalars['Int'],
  isLeft: Scalars['Boolean'],
  value?: Maybe<Scalars['Float']>,
};

export type Subject = {
  id: Scalars['ID'],
  leagueId: Scalars['String'],
  fk: Scalars['String'],
  name: Scalars['String'],
  url: Scalars['String'],
  updatedAt?: Maybe<Scalars['Timestamp']>,
  game?: Maybe<Game>,
};

export type SubjectUnion = Player | Team;

export type Subscription = {
   __typename?: 'Subscription',
  subscribeUserNotifications: User,
};

export type Team = Subject & {
   __typename?: 'Team',
  id: Scalars['ID'],
  leagueId: Scalars['String'],
  fk: Scalars['String'],
  name: Scalars['String'],
  url: Scalars['String'],
  updatedAt?: Maybe<Scalars['Timestamp']>,
  game?: Maybe<Game>,
  shortName: Scalars['String'],
  location: Scalars['String'],
};

export type TeamExpression = Expression & {
   __typename?: 'TeamExpression',
  id: Scalars['Int'],
  isLeft: Scalars['Boolean'],
  team?: Maybe<Team>,
  game?: Maybe<Game>,
  value?: Maybe<Scalars['Float']>,
  metric?: Maybe<BetMap>,
};


export type TwitterUser = {
   __typename?: 'TwitterUser',
  id: Scalars['Int'],
  screenName: Scalars['String'],
  name: Scalars['String'],
  idStr: Scalars['String'],
  indices?: Maybe<Array<Maybe<Scalars['Int']>>>,
};

export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  name?: Maybe<Scalars['String']>,
  userName: Scalars['String'],
  email?: Maybe<Scalars['String']>,
  twitterUser?: Maybe<TwitterUser>,
  notifications: Array<Maybe<Notification>>,
  viewedProfileLast?: Maybe<Scalars['Timestamp']>,
  betsWon: Scalars['Int'],
  betsLost: Scalars['Int'],
  inProgressBetIds: Array<Maybe<Scalars['String']>>,
  pendingYouBetIds: Array<Maybe<Scalars['String']>>,
  pendingThemBetIds: Array<Maybe<Scalars['String']>>,
};




      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = {
  "__schema": {
    "types": [
      {
        "kind": "INTERFACE",
        "name": "Expression",
        "possibleTypes": [
          {
            "name": "PlayerExpression"
          },
          {
            "name": "TeamExpression"
          },
          {
            "name": "StaticExpression"
          }
        ]
      },
      {
        "kind": "INTERFACE",
        "name": "Subject",
        "possibleTypes": [
          {
            "name": "Player"
          },
          {
            "name": "Team"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "SubjectUnion",
        "possibleTypes": [
          {
            "name": "Player"
          },
          {
            "name": "Team"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "ExpressionUnion",
        "possibleTypes": [
          {
            "name": "StaticExpression"
          },
          {
            "name": "PlayerExpression"
          },
          {
            "name": "TeamExpression"
          }
        ]
      }
    ]
  }
};
      export default result;
    