function asyncFib(n:number, fn:Function):void{
    if(n===1){ fn(0);  return}
    if(n===2) { fn(1);  return}
    if(n===3) { fn(1);  return}
    let fib= [ BigInt(1), BigInt(1)]
    let xN=3
  
    function countCl(cb:Function):void {
      xN++
      const fibNext= BigInt(fib[0]+fib[1])
      fib[0]=fib[1]
      fib[1]=fibNext
      
      if (n===xN) {
          cb(fibNext);

          return
      }

      setImmediate(countCl.bind(null, cb));
    }

    countCl(fn)
}

process.on('message', (message:{number:number,ticket:number}) => {
  console.log('find fibonacci >>',message);

  if ( typeof message === 'object' && "number" in message) {
    const {number} = message

    asyncFib(number, (result:BigInt) =>{
      const resultString = result.toString()
            
      if(process.send) process.send({...message, result:resultString });
    })
  }  
 });

process.on("exit",() => {
  console.log('exit');
})
process.on("uncaughtException",(err) => {
  console.error(err)
})
