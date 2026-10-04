// Avoid newer static helpers: older iOS browsers still support these constructors.
export function jsonResponse(data:unknown,init:ResponseInit={}){
 const headers=new Headers(init.headers);
 headers.set('Content-Type','application/json');
 return new Response(JSON.stringify(data),{...init,headers});
}

export function requestTimeout(milliseconds:number){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),milliseconds);
 return {signal:controller.signal,clear:()=>clearTimeout(timer)};
}
