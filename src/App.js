import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react'
import "@aws-amplify/ui-react/styles.css"

import { generateClient } from 'aws-amplify/api';
import { createToDo } from './graphql/mutations';
import { listToDos } from './graphql/queries';
import { onCreateToDo } from './graphql/subscriptions';

import amplifyconfig from './amplifyconfiguration.json';
Amplify.configure(amplifyconfig);

const client = generateClient();

const MutationButton = document.getElementById('MutationEventButton');
const MutationResult = document.getElementById('MutationResult');
const QueryResult = document.getElementById('QueryResult');
const SubscriptionResult = document.getElementById('SubscriptionResult');

async function addTodo() {
  const todo = {
    name: 'Use AppSync',
    description: 'Realtime and Offline (${new Date().toLocaleString()})'
  };

  return await client.graphql({
    query: createToDo,
    variables: { input: todo },
  });
}

async function fetchTodos() {
    try { 
      const response = await client.graphql({ query: listToDos });
    
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
  client.graphql({ query: onCreateToDo }).subscribe({
    next: (evt) => {
      const todo = evt.value.data.onCreateTodo;
      SubscriptionResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`;
    },
    error: (err) => console.log('error', err)
  });
}

subscribeToNewTodos();
fetchTodos();

// function App({ signOut, user}) {
//   return (
//     <>
//       <h1>Hello {user.username}</h1>
//       <button onCLick={signOut}>Sign out</button>
//     </>
//   );
// }

// export default withAuthenticator(App);