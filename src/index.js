const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({error: "Customer not found"});
    }

    request.customer = customer;

    return next ();
}

// Faz o balanço da conta
function getBalance (statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

// Criação da conta
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
        statemant: []
    });

    return response.status(201).send();
})

// O estado da conta
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer.statemant);
})

// Deposito de dinheiro
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statemant.push(statementOperation);

    return response.status(201).send();
});

// Saque do dinheiro
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statemant);

    if(balance < amount) {
        return response.status(400).json({error: 'Saldo insuficiente'});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statemant.push(statementOperation);

    return response.status(201).send()
})

// Extrato por data
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const formatDate = new Date(date + ' 00:00');

    const statement = customer.statemant.filter((statement) => statement.created_at.toDateString() === new Date(formatDate).toDateString());

    return response.json(statement);
})

// Atualização de conta do cliente
app.put('/account', verifyIfExistsAccountCPF ,(request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
})

// Retornar os dados do cliente
app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    // Splice
    customers.splice(customer, 1);

    return response.status(200).json(customers);
})
app.listen(3333);