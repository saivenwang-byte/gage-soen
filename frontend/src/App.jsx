import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import AoSoPage from './pages/AoSoPage';
import XiaDouDouPage from './pages/XiaDouDouPage';
import ProfilePage from './pages/ProfilePage';
import VersionStamp from './components/VersionStamp';

function MainShell() {
  const { mainTab, setMainTab } = useApp();

  return (
    <>
      {mainTab === 'aoso' && <AoSoPage />}
      {mainTab === 'xiadoudou' && <XiaDouDouPage />}
      {mainTab === 'profile' && <ProfilePage />}
      <VersionStamp />
      <BottomNav active={mainTab} onChange={setMainTab} />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
