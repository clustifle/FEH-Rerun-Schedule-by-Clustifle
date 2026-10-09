import {Component,Suspense,type ReactNode} from 'react';
export default class ToolBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<section role="alert"><p>This tool could not load. Check your connection and reload to try again.</p><button className="secondary" onClick={()=>location.reload()}>Reload</button></section>:<Suspense fallback={<p role="status">Loading tools…</p>}>{this.props.children}</Suspense>;}
}
