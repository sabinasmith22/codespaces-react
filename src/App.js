

import styles from './style.css';
import { Amplify } from 'aws-amplify';

import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import PropTypes from 'prop-types'

import { generateClient } from 'aws-amplify/api';
import { createTodo } from './graphql/mutations.ts';
import { listTodos } from './graphql/queries.ts';
import { onCreateTodo } from './graphql/subscriptions.ts';

// import amplifyconfig from './graphql/schema.json';
Amplify.configure();

const client = generateClient();

const MutationButton = document.getElementById('MutationEventButton');
const MutationResult = document.getElementById('MutationResult');
const QueryResult = document.getElementById('QueryResult');
const SubscriptionResult = document.getElementById('SubscriptionResult');

const App = ({ signOut, user }) => {
  return (
    <div style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>
      <h2>Amplify Todos</h2>
      ...
    </div>
  );
}

//
App.propTypes = {
  signOut: PropTypes.func,
  user: PropTypes.object
}

export default withAuthenticator(App);

async function addTodo() {
  const todo = {
    name: 'Use AppSync',
    description: 'Realtime and Offline (${new Date().toLocaleString()})'
  };

  return await client.graphql({
    query: createTodo,
    variables: { input: todo },
  });
}

async function fetchTodos() {
    try { 
      const response = await client.graphql({ query: listTodos });
    
      response.data.listTodos.items.map((todo,i) => {
        QueryResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`;
      });
  } catch (e) {
    console.log('error fetching todos', e);
  }
}

MutationButton.addEventListener('click', (evt) => {
  addTodo().then((evt) => {
    MutationResult.innerHTML += `<p>${evt.data.createTodo.name} - ${evt.data.createTodo.description}</p>`;
  });
});

function subscribeToNewTodos() {
  client.graphql({ query: onCreateTodo }).subscribe({
    next: (evt) => {
      const todo = evt.value.data.onCreateTodo;
      SubscriptionResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`;
    },
    error: (err) => console.log('error', err)
  });
}


subscribeToNewTodos();
fetchTodos();