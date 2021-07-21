const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(resquest, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({error: "Customer not found"});
    }

    return next ();
}


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

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    return response.json(customer.statemante);
})

app.listen(3333);