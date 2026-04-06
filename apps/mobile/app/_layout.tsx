import '../global.css'
import { useEffect } from 'react'
import { Slot, router, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../lib/auth-context'
import { View, ActivityIndicator } from 'react-native'

const queryClient = new QueryClient()

function AuthGate() {
  const { session, loading } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/cases')
    }
  }, [session, loading, segments])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }
  return <Slot />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  )
}
