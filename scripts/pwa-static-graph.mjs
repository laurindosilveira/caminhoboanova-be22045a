import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname,relative,sep} from "node:path";
export function staticPwaGraph(directory) {
 const root=resolve(directory), html=readFileSync(resolve(root,"index.html"),"utf8");
 const entry=html.match(/<script[^>]+src="\/([^"]+)/)?.[1];
 if(!entry)throw new Error("Missing application entry in built HTML");
 const todo=[entry],seen=new Set();
 while(todo.length){
  const item=todo.pop();if(seen.has(item))continue;seen.add(item);
  const file=resolve(root,item);
  if(!file.startsWith(root+sep)||!existsSync(file))throw new Error(`Invalid application asset: ${item}`);
  for(const match of readFileSync(file,"utf8").matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+\.js)["']/g)){
   const dep=relative(root,resolve(dirname(file),match[1])).split(sep).join("/");
   if(!seen.has(dep))todo.push(dep);
  }
 }
 return seen;
}
