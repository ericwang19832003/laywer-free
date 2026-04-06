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
import { supabase } from '../../lib/supabase'

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email
    )

    if (resetError) {
      setError(
        "We couldn't send a reset link right now. Please check your email and try again."
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
          We've sent a password reset link to {email}. Follow the instructions
          in the email to reset your password.
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
          Reset your password
        </Text>
        <Text className="text-base text-warm-muted mb-8">
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {error ? (
          <View className="bg-calm-amber/10 border border-calm-amber rounded-lg p-3 mb-4">
            <Text className="text-calm-amber text-sm">{error}</Text>
          </View>
        ) : null}

        <Text className="text-sm font-medium text-warm-text mb-1">Email</Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 text-base text-warm-text bg-white mb-6"
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TouchableOpacity
          className="bg-calm-indigo rounded-lg py-3 items-center"
          style={{ minHeight: 44 }}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Send Reset Link
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-calm-indigo text-sm font-semibold">
                Back to sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
