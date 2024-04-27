import { Map } from './components/Map';
import LeafletLogo from './assets/leafletlogo.png';
import ReactIcon from './assets/reacticon.png';
import tru from './assets/truestatelogo.png'

function App() {
  return (
    <div className="App">
      <nav>
        {/* <img src={LeafletLogo} alt={'leaflet logo'} className="logo-mid"/>
        <img src={ReactIcon} alt={'react logo'} className="logo-small"/> */}
        <img src={tru} alt={'tru logo'} className="logo-mid"/>
      </nav>
      <Map />
    </div>
  );
}

export default App;
