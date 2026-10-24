import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
export default function NotFound() {
  return (<main className="center-page"><Logo /><h1>Page not found</h1><p className="muted">That address doesn't exist in NexusOne. Head back to the start.</p><Link className="btn btn--primary" to="/">Go to home</Link></main>);
}
