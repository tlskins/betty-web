import React, { useState, Fragment } from "react";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  FixedWrapper,
  TitleBar,
  TextInput,
  MessageList,
  Message,
  MessageText,
  MessageGroup,
  MessageTitle,
  MessageMedia,
  TextComposer,
  Row,
  Fill,
  Fit,
  IconButton,
  SendButton,
  CloseIcon,
  Bubble,
  ThemeProvider,
  purpleTheme,
  ChatIcon
} from "@livechat/ui-kit";

const theme = {
  ...purpleTheme,
  TextComposer: {
    ...purpleTheme.TextComposer,
    css: {
      ...purpleTheme.TextComposer.css,
      marginTop: "1em"
    }
  },
  OwnMessage: {
    ...purpleTheme.OwnMessage,
    secondaryTextColor: "#fff"
  }
};

const Subscription = gql`
  subscription MoreMessages($channel: String!) {
    messageAdded(roomName: $channel) {
      id
      text
      createdBy
    }
  }
`;

const Mutation = gql`
  mutation sendMessage($text: String!, $channel: String!, $name: String!) {
    post(text: $text, roomName: $channel, username: $name) {
      id
    }
  }
`;

function ChatInput({ channel, name }) {
  const [postChat] = useMutation(Mutation);

  return (
    <TextComposer
      onSend={text => postChat({ variables: { text, channel, name } })}
    >
      <Row align="center">
        <Fill>
          <TextInput />
        </Fill>
        <Fit>
          <SendButton />
        </Fit>
      </Row>
    </TextComposer>
  );
}

function ChatHistory({ channel, messages, setMessages, name, minimize }) {
  useSubscription(Subscription, {
    variables: { channel },
    onSubscriptionData: ({ client, subscriptionData }) => {
      const newMessages = [...messages];
      const msg = subscriptionData.data.messageAdded;
      let last = newMessages.pop();

      // group messages by created by
      if (last) {
        if (last[0].createdBy === msg.createdBy) {
          last.push(msg);
          newMessages.push(last);
        } else {
          newMessages.push(last, [msg]);
        }
      } else {
        newMessages.push([msg]);
      }

      setMessages(newMessages);
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <TitleBar
        rightIcons={[
          <IconButton key="close" onClick={minimize}>
            <CloseIcon />
          </IconButton>
        ]}
        title="Welcome to LiveChat"
      />
      <div
        style={{
          flexGrow: 1,
          minHeight: 0,
          height: "100%"
        }}
      >
        <MessageList active containScrollInSubtree>
          {messages.map((messageGroup, i) => (
            <MessageGroup key={i} onlyFirstWithMeta>
              {messageGroup.map(message => (
                <Message
                  authorName={message.createdBy}
                  date={message.parsedDate}
                  isOwn={message.createdBy === name}
                  key={message.id}
                >
                  <Bubble isOwn={message.createdBy === name}>
                    {message.title && <MessageTitle title={message.title} />}
                    {message.text && <MessageText>{message.text}</MessageText>}
                    {message.imageUrl && (
                      <MessageMedia>
                        <img src={message.imageUrl} alt="msg" />
                      </MessageMedia>
                    )}
                  </Bubble>
                </Message>
              ))}
            </MessageGroup>
          ))}
        </MessageList>
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: ".6em",
          padding: ".4em",
          background: "#fff",
          color: "#888"
        }}
      >
        {"Powered by LiveChat"}
      </div>
    </div>
  );
}

export function Chat() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [messages, setMessages] = useState([]);

  return (
    <Fragment>
      name: <br />
      <input onChange={e => setName(e.target.value)} /> <br />
      channel: <br />
      <input onChange={e => setChannel(e.target.value)} /> <br />
      <ThemeProvider theme={theme}>
        <FixedWrapper.Root maximizedOnInit>
          <FixedWrapper.Maximized>
            <ChatHistory
              channel={channel}
              messages={messages}
              setMessages={setMessages}
              name={name}
            />
            <ChatInput channel={channel} name={name} />
          </FixedWrapper.Maximized>
          <FixedWrapper.Minimized>
            <Minimized />
          </FixedWrapper.Minimized>
        </FixedWrapper.Root>
      </ThemeProvider>
    </Fragment>
  );
}

const Minimized = ({ maximize }) => (
  <div
    onClick={maximize}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "60px",
      height: "60px",
      background: "#0093FF",
      color: "#fff",
      borderRadius: "50%",
      cursor: "pointer"
    }}
  >
    <IconButton color="#fff">
      <ChatIcon />
    </IconButton>
  </div>
);
