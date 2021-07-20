const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

/* 
    cpf - string
    name - string
    id - uuid
    statement - []
*/

app.post("/account", (request, response) => {
    const { name, cpf } = request.body;

    const customerAlreadyExists = customers.some((customers) => customers.cpf === cpf);

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exist!" })
    }

    customers.push({ 
        cpf,
        name,
        id: uuidv4(),
        statemante: []
    });

    return response.status(201).send();
})

app.get("/statement/:cpf", (request, response) => {
    const { cpf } = request.params;

})

app.listen(3333);