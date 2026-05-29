import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from './src/context/TaskContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <TaskProvider>
      <HomeScreen />
      <StatusBar style="dark" />
    </TaskProvider>
  );
}
