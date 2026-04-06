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
import { Link } from 'expo-router'
import { useAuth } from '../../lib/auth-context'

export default function SignupScreen() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match — please try again.')
      return
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }

    setError('')
    setLoading(true)

    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(
        "We couldn't create your account right now. Please check your details and try again."
      )
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <View className="flex-1 bg-warm-bg justify-center px-6">
        <Text className="text-3xl font-bold text-warm-text mb-2">
          Check your email
        </Text>
        <Text className="text-base text-warm-muted mb-8">
          We've sent a confirmation link to {email}. Tap the link to activate
          your account.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            className="bg-calm-indigo rounded-lg py-3 items-center"
            style={{ minHeight: 44 }}
          >
            <Text className="text-white font-semibold text-base">
              Back to sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-warm-bg"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-warm-text mb-2">
          Create an account
        </Text>
        <Text className="text-base text-warm-muted mb-8">
          Get started in just a few steps
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
          className="border border-warm-border rounded-lg px-4 py-3 text-base text-warm-text bg-white mb-4"
          placeholder="At least 6 characters"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        <Text className="text-sm font-medium text-warm-text mb-1">
          Confirm password
        </Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 text-base text-warm-text bg-white mb-6"
          placeholder="Re-enter your password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
        />

        <TouchableOpacity
          className="bg-calm-indigo rounded-lg py-3 items-center"
          style={{ minHeight: 44 }}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-warm-muted text-sm">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-calm-indigo text-sm font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
