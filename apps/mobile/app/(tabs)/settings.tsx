import { View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from '../../lib/auth-context'

export default function SettingsScreen() {
  const { user, signOut } = useAuth()

  return (
    <View className="flex-1 bg-warm-bg px-6 pt-4">
      <View className="bg-white rounded-xl p-4 border border-warm-border mb-4">
        <Text className="text-warm-muted text-sm">Signed in as</Text>
        <Text className="text-warm-text font-medium mt-1">{user?.email}</Text>
      </View>

      <TouchableOpacity
        className="bg-white rounded-xl p-4 border border-warm-border items-center"
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Text className="text-calm-amber font-medium">Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}
