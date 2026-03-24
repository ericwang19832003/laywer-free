import { Tabs } from 'expo-router'
import { Briefcase, Settings } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#78716C',
        tabBarStyle: { backgroundColor: '#FAFAF8', borderTopColor: '#E7E5E4' },
        headerStyle: { backgroundColor: '#FAFAF8' },
        headerTintColor: '#1C1917',
      }}
    >
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Cases',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
