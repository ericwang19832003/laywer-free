import { View, Text } from 'react-native'

export default function Home() {
  return (
    <View className="flex-1 justify-center items-center bg-warm-bg">
      <Text className="text-3xl font-bold text-warm-text">Lawyer Free</Text>
      <Text className="text-base text-warm-muted mt-2">Your legal case assistant</Text>
    </View>
  )
}
