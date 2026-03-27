import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'

export default function CaseOverview() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['case-dashboard', id],
    queryFn: () => api.get<any>(`/api/cases/${id}/dashboard`),
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-warm-bg" contentContainerStyle={{ padding: 16 }}>
      {/* Next Step Card */}
      {data?.nextTask && (
        <View className="bg-white rounded-xl p-4 border border-warm-border mb-3">
          <Text className="text-sm text-warm-muted mb-1">Next Step</Text>
          <Text className="text-warm-text font-semibold">{data.nextTask.title}</Text>
        </View>
      )}

      {/* Upcoming Deadlines */}
      <View className="bg-white rounded-xl p-4 border border-warm-border mb-3">
        <Text className="text-sm text-warm-muted mb-2">Upcoming Deadlines</Text>
        {(data?.deadlines ?? []).length === 0 ? (
          <Text className="text-warm-muted text-sm">No upcoming deadlines</Text>
        ) : (
          data.deadlines.slice(0, 3).map((d: any) => (
            <View key={d.id} className="flex-row justify-between py-2 border-b border-warm-border">
              <Text className="text-warm-text text-sm flex-1">{d.title}</Text>
              <Text className="text-calm-amber text-sm">
                {new Date(d.due_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Case Details */}
      <View className="bg-white rounded-xl p-4 border border-warm-border">
        <Text className="text-sm text-warm-muted mb-2">Case Details</Text>
        <Text className="text-warm-text text-sm">Status: {data?.case?.status ?? '\u2014'}</Text>
        <Text className="text-warm-text text-sm mt-1">Role: {data?.case?.role ?? '\u2014'}</Text>
        <Text className="text-warm-text text-sm mt-1">
          Court: {data?.case?.court_type ?? '\u2014'}
        </Text>
      </View>
    </ScrollView>
  )
}
