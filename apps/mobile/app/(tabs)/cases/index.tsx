import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '../../../lib/api'
import { ChevronRight } from 'lucide-react-native'

export default function CaseList() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.get<{ cases: any[] }>('/api/cases'),
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg px-6">
        <Text className="text-warm-muted text-center">
          Something went wrong loading your cases.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 bg-calm-indigo rounded-lg px-6 py-3"
        >
          <Text className="text-white font-medium">Try again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const cases = data?.cases ?? []

  if (cases.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg px-6">
        <Text className="text-xl font-bold text-warm-text mb-2">No cases yet</Text>
        <Text className="text-warm-muted text-center mb-6">
          Create your first case to get started.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-warm-bg"
      contentContainerStyle={{ padding: 16 }}
      data={cases}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 border border-warm-border flex-row items-center"
          onPress={() => router.push(`/cases/${item.id}`)}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text className="text-warm-text font-semibold text-base">
              {item.dispute_type?.replace(/_/g, ' ') ?? 'Case'}
            </Text>
            <Text className="text-warm-muted text-sm mt-1 capitalize">
              {item.role} · {item.status}
            </Text>
          </View>
          <ChevronRight size={20} color="#78716C" />
        </TouchableOpacity>
      )}
    />
  )
}
