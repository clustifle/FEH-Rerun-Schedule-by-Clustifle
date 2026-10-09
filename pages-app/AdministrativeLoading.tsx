import logo from './admin-assets/manager-logo.png';
import symbol from './admin-assets/loading-symbol.png';
import './AdministrativeLoading.css';

export default function AdministrativeLoading(){
 return <div className="adm-loading" role="status" aria-label="Loading Administrative Manager"><img className="adm-loading-logo" src={logo} alt="FEH Rerun Schedule by Clustifle Administrative Manager"/><img className="adm-loading-symbol" src={symbol} alt=""/><span className="adm-loading-text">Loading Administrative Manager…</span></div>;
}
