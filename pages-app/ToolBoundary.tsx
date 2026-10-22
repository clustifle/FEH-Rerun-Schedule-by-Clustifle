import {Component,Suspense,type ReactNode} from 'react';
export default class ToolBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<section className="quality-error" role="alert"><h2>This page could not load</h2><p>Check your connection, then try again. Reloading may discard edits that have not been saved.</p><div className="quality-error-actions"><button className="secondary" onClick={()=>this.setState({failed:false})}>Try again</button><button className="secondary" onClick={()=>location.reload()}>Reload page</button></div></section>:<Suspense fallback={<p className="quality-loading" role="status">Loading…</p>}>{this.props.children}</Suspense>;}
}
