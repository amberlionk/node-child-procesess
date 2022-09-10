import {fork} from "child_process"
import { createClient } from 'redis';
import express, { Express, Request, Response } from 'express'

const PORT=process.env.PORT || 8080
const REDIS_HOST=process.env.REDIS_HOST || "localhost"
const REDIS_PORT=process.env.REDIS_PORT || 6379

const client = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});
client.on('error', (err) => console.log('Redis Client Error', err));


let taskIncr=0

const fibonacciFinder = fork(__dirname + '/slowFibonacci');
fibonacciFinder.on('message', (message) => {
    console.log('fibonacciFinder response >>',message);

    if ( typeof message === 'object'&& "result" in message) {
      const {ticket, result} = message as {ticket:number, result:number}
      client.set(`ticket_${ticket}`, result)
    }
    
});
fibonacciFinder.on("error",console.error)


const app: Express = express()
app.use(express.json());
app.use(express.urlencoded());

app.post('/input', async (req: Request, res: Response) => {
  const {number}= req.body

  taskIncr++
  await client.set("taskIncr", taskIncr)
  
  fibonacciFinder.send({
    ticket:taskIncr,
    number
  });
  

  res.send({ticket:taskIncr});
});

app.get('/output', async (req: Request, res: Response) => {
  const {ticket} = req.query
  
  const result = await client.get(`ticket_${ticket}`)

  if(result){
    res.send({"Fibonacci":Number(result)})
  }else{
     res.status(404).send('Answer not found')
  }
});

app.listen(PORT, async () => {
  await client.connect();
  taskIncr = Number(await client.get('taskIncr'))
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
