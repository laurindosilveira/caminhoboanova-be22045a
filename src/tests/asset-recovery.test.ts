import {describe,expect,it,vi} from "vitest";
import {installAssetRecovery} from "@/lib/assetRecovery";
function fixture(online=true,dirty=false) {
 const handlers=new Map<string,(event:Event)=>void>(), values=new Map<string,string>(), reload=vi.fn();
 const target={navigator:{onLine:online},document:{querySelector:()=>dirty?{}:null},sessionStorage:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)},location:{reload},addEventListener:(name:string,fn:(event:Event)=>void)=>handlers.set(name,fn),removeEventListener:(name:string)=>handlers.delete(name)} as unknown as Window;
 installAssetRecovery(target);
 const fire=()=>{const event=new Event("vite:preloadError",{cancelable:true});handlers.get("vite:preloadError")!(event);return event;};
 return {fire,reload};
}
describe("missing deployment assets",()=>{
 it("retries once without a reload loop",()=>{const f=fixture();expect(f.fire().defaultPrevented).toBe(true);f.fire();expect(f.reload).toHaveBeenCalledTimes(1);});
 it("does not reload when offline or when work is unsaved",()=>{for(const f of [fixture(false,false),fixture(true,true)]){expect(f.fire().defaultPrevented).toBe(false);expect(f.reload).not.toHaveBeenCalled();}});
});
