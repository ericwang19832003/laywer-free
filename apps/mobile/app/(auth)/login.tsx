import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '../../lib/auth-context'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError("That didn't work — please check your email and password.")
      setLoading(false)
      return
    }

    router.replace('/(tabs)/cases')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-warm-bg"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-warm-text mb-2">
          Welcome back
        </Text>
        <Text className="text-base text-warm-muted mb-8">
          Sign in to your account
        </Text>

        {error ? (
          <View className="bg-calm-amber/10 border border-calm-amber rounded-lg p-3 mb-4">
            <Text className="text-calm-amber text-sm">{error}</Text>
          </View>
        ) : null}

        <Text className="text-sm font-medium text-warm-text mb-1">Email</Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 text-base text-warm-text bg-white mb-4"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Text className="text-sm font-medium text-warm-text mb-1">
          Password
        </Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 text-base text-warm-text bg-white mb-2"
          placeholder="Your password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        <Link href="/(auth)/reset-password" asChild>
          <TouchableOpacity className="self-end mb-6" style={{ minHeight: 44 }}>
            <Text className="text-calm-indigo text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className="bg-calm-indigo rounded-lg py-3 items-center"
          style={{ minHeight: 44 }}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-warm-muted text-sm">
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-calm-indigo text-sm font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
