import React, { useState, useEffect, Fragment } from "react";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  FixedWrapper,
  Avatar,
  TitleBar,
  TextInput,
  MessageList,
  Message,
  MessageText,
  AgentBar,
  Title,
  Subtitle,
  MessageGroup,
  MessageButtons,
  MessageButton,
  MessageTitle,
  MessageMedia,
  TextComposer,
  Row,
  Fill,
  Fit,
  IconButton,
  SendButton,
  EmojiIcon,
  CloseIcon,
  Column,
  RateGoodIcon,
  RateBadIcon,
  Bubble,
  ThemeProvider,
  purpleTheme,
  darkTheme,
  elegantTheme
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

function ChatInput({ channel, name }) {
  let input;
  const [postChat, { data }] = useMutation(Mutation);

  return (
    <TextComposer>
      <Row align="center">
        <Fill>
          <input ref={node => (input = node)} />
        </Fill>
        <Fit>
          <SendButton
            onClick={() => {
              postChat({ variables: { text: input.value, channel, name } });
              input.value = "";
            }}
          />
        </Fit>
      </Row>
    </TextComposer>
  );
}

function ChatHistory({ channel, messages, setMessages, name }) {
  const { data, loading } = useSubscription(Subscription, {
    variables: { channel },
    onSubscriptionData: ({ client, subscriptionData }) => {
      console.log("onSubscriptionData", subscriptionData);
      const newMessages = [...messages];
      const msg = subscriptionData.data.messageAdded;
      let last = newMessages.pop();

      if (last) {
        if (last[0].createdBy == msg.createdBy) {
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

  console.log("messages", messages);

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
          <IconButton key="close">
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
                        <img src={message.imageUrl} />
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
    <ThemeProvider theme={theme}>
      name: <br />
      <input onChange={e => setName(e.target.value)} /> <br />
      channel: <br />
      <input onChange={e => setChannel(e.target.value)} /> <br />
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
      </FixedWrapper.Root>
    </ThemeProvider>
  );
}

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
