import React, { useState, useEffect, Fragment } from "react";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

function ChatInput({ channel, name }) {
  let input;
  const [postChat, { data }] = useMutation(Mutation);

  return (
    <div>
      <input ref={node => (input = node)} />
      <button
        onClick={() => {
          postChat({ variables: { text: input.value, channel, name } });
          input.value = "";
        }}
      >
        send
      </button>
    </div>
  );
}

function ChatHistory({ channel, messages, setMessages }) {
  const { data, loading } = useSubscription(Subscription, {
    variables: { channel },
    onSubscriptionData: ({ client, subscriptionData }) => {
      setMessages([...messages, subscriptionData.data.messageAdded]);
    }
  });

  console.log("data", data);

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.createdBy}: {msg.text}
        </div>
      ))}
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
      <ChatHistory
        channel={channel}
        messages={messages}
        setMessages={setMessages}
      />
      <ChatInput channel={channel} name={name} />
    </Fragment>
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

const Query = gql`
  query Room($channel: String!) {
    room(name: $channel) {
      messages {
        id
        text
        createdBy
      }
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
