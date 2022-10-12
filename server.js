const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');
const { nanoid } = require("nanoid");
require('dotenv').config()

const schemaString = readFileSync('./graphql/schema.graphql', { encoding: 'utf8' });

const schema = buildSchema(schemaString);

let todos = [
    {
        id: nanoid(), index: 1, title: "Lorem Ipsum", completed: false,
        subtasks: [
            { id: nanoid(), index: 1.1, title: "Lorem Ipsum", completed: false, size: '40px' },
            { id: nanoid(), index: 1.2, title: "Lorem Dolor", completed: true, size: '36px' },
            { id: nanoid(), index: 1.3, title: "Lorem Dolor", completed: true, size: '32px' },
            { id: nanoid(), index: 1.4, title: "Lorem Dolor", completed: true, size: '28px' },
            { id: nanoid(), index: (1.10).toFixed(4) , title: "Lorem Dolor", completed: true, size: '24px' },
        ]//не важно, что напишу в индексе, на фронт это передается без нуля
    },//if index > 9 +1 и на клиенте -1 мб вместо этого кастомный тип в схеме гкль
    {
        id: nanoid(), index: 2, title: "Do smthng", completed: true, subtasks: [
            { id: nanoid(), index: 2.1, title: "Lorem Ipsum", completed: false, size: '40px' },
            { id: nanoid(), index: 2.2, title: "Lorem Dolor", completed: true, size: '36px' },
        ]
    },
    {
        id: nanoid(), index: 3, title: "Fuck 2D anime girl", completed: false, subtasks: []
    }
]

const addTodo = (id, title, completed, subtasks = []) => {
    let index = todos.length ? parseInt(todos.at(-1).index) + 1 : 1

    return {
        id, index, title, completed, subtasks
    }
}

const addSubtask = (params) => {
/*     console.log(params.subtasks.at(-1).index.toString().split('.')[1]);asd
 */    console.log((1.10).toFixed(2));
/*     console.log((parseFloat(params.subtasks.at(-1).index.toString().split('.')[1]) + 1));
 */    let index = params.subtasks.length ? params.index + '.' + (parseFloat(params.subtasks.at(-1).index.toString().split('.')[1]) + 1) : parseFloat(params.index) + '.' + 1
    let title = 'Type here'
    let size = '';

    if (params.subtasks.at(-1)) {
        if (parseInt(params.subtasks.at(-1).size) > 14) {
            size = (Math.ceil(parseInt(params.subtasks.at(-1).size) - parseInt(params.subtasks.at(-1).size) * 0.05)) + 'px'
        } else {
            size = '14px'
        }
    } else {
        size = "40px"
    }
    return { id: nanoid(), index: index, title: title, completed: false, size: size }
}

const root = {
    getAllTodos: () => {
        return todos;
    },
    getTodo: params => {
        return todos.find(({ id }) => params.id === id);
    },
    toggleCheckbox: params => {
        todos.map(((obj) => {
            if (params.id === obj.id) {
                obj.completed = !obj.completed
                return obj.completed
            }
        }))
    },
    toggleSubtaskCheckbox: params => {
        todos.map(((obj) => {
            obj.subtasks.map((subtask) => {
                if (params.id === subtask.id) {
                    subtask.completed = !subtask.completed
                    return subtask.completed
                }
            })
        }))
    },
    removeTodo: params => {
        todos = todos.filter((({ id }) =>
            params.id !== id
        ))
        return todos
    },
    removeSubtask: params => {
        todos.map(((obj) => {
            obj.subtasks = obj.subtasks.filter((subtask) =>
                params.id !== subtask.id
            )
        }))
        return todos
    },
    createTodo: ({ id, title, completed }) => {
        todos.push(addTodo(id, title, completed))
        return addTodo(id, title, completed)
    },
    createSubtask: params => {
        todos.map(((obj) => {
            if (obj.index === parseInt(params.index)) {
                obj.subtasks = [...obj.subtasks, addSubtask(params)]
            }
        }))
        return true
    },
    removeAllTodos: () => {
        todos = []
        return true
    }
}
const app = express();

app.use(cors());

app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    })
);

app.listen(process.env.PORT);

console.log(`Running a GraphQL API server at http://localhost:${process.env.PORT}/graphql`);