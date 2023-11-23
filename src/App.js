

import styles from './style.css';
import { Amplify } from 'aws-amplify';

import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import PropTypes from 'prop-types'

import { generateClient } from 'aws-amplify/api';
import { createTodo } from './graphql/mutations.ts';
import { listTodos } from './graphql/queries.ts';
import { onCreateTodo } from './graphql/subscriptions.ts';
import { useEffect, useState } from 'react';

// import amplifyconfig from './graphql/schema.json';
Amplify.configure();

const initialState = {name: '', description: ''};
const client = generateClient();

const MutationButton = document.getElementById('MutationEventButton');
const MutationResult = document.getElementById('MutationResult');
const QueryResult = document.getElementById('QueryResult');
const SubscriptionResult = document.getElementById('SubscriptionResult');

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <div style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
      <Button onClick={signOut} style={styles.button}>
        Sign out
      </Button>
      <h2>Amplify Todos</h2>
      <input
        onChange={(event) => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
        </div>
      ))}
    </div>
  );
};


App.propTypes = {
  signOut: PropTypes.func,
  user: PropTypes.object
}

export default withAuthenticator(App);