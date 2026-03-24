import { View, Text, StyleSheet } from 'react-native'

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lawyer Free</Text>
      <Text style={styles.subtitle}>Your legal case assistant</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  subtitle: {
    fontSize: 16,
    color: '#78716C',
    marginTop: 8,
  },
})
