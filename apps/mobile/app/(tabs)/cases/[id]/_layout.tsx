import { Tabs, useLocalSearchParams } from 'expo-router'

export default function CaseDashboardLayout() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#78716C',
        tabBarStyle: { backgroundColor: '#FAFAF8' },
        tabBarItemStyle: { width: 'auto' },
        headerStyle: { backgroundColor: '#FAFAF8' },
        headerTintColor: '#1C1917',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="deadlines" options={{ title: 'Deadlines' }} />
      <Tabs.Screen name="evidence" options={{ title: 'Evidence' }} />
      <Tabs.Screen name="discovery" options={{ title: 'Discovery' }} />
      <Tabs.Screen name="motions" options={{ title: 'Motions' }} />
      <Tabs.Screen name="research" options={{ title: 'Research' }} />
      <Tabs.Screen name="case-file" options={{ title: 'Files' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="health" options={{ title: 'Health' }} />
    </Tabs>
  )
}
