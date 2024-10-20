import UWVChatbot from '../components/UWVChatbot'
import MaintenancePage from '../components/MaintenancePage' // Zorg ervoor dat je deze component maakt

const isUnderMaintenance = true;

export default function Home() {
  if (isUnderMaintenance) {
    return <MaintenancePage />;
  }

  // Originele code (behouden door commentaar)
  // return <UWVChatbot />

  return <UWVChatbot />
}
