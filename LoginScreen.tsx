import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import AuthService from '../services/auth.service';

/**
 * Tela de Login
 * Permite que o usuário faça login na plataforma Educk
 * 
 * @returns {JSX.Element} Componente de tela de login
 */
const LoginScreen = ({ navigation }) => {
  // Estados para armazenar os dados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Função para validar o formulário antes de enviar
   * @returns {boolean} Verdadeiro se o formulário for válido
   */
  const validateForm = () => {
    // Limpar erro anterior
    setError('');

    // Validar e-mail
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail');
      return false;
    }

    // Validação simples de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, informe um e-mail válido');
      return false;
    }

    // Validar senha
    if (!password) {
      setError('Por favor, informe sua senha');
      return false;
    }

    return true;
  };

  /**
   * Função para lidar com o envio do formulário de login
   */
  const handleLogin = async () => {
    // Validar formulário
    if (!validateForm()) {
      return;
    }

    try {
      // Iniciar carregamento
      setIsLoading(true);

      // Chamar serviço de autenticação
      const result = await AuthService.login(email, password);

      // Verificar resultado
      if (result.success) {
        // Limpar formulário
        setEmail('');
        setPassword('');
        setError('');

        // Navegar para a tela inicial
        navigation.replace('Home');
      } else {
        // Exibir mensagem de erro
        setError(result.error?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      // Finalizar carregamento
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>Bem-vindo ao Educk</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      {/* Formulário */}
      <View style={styles.form}>
        {/* Mensagem de erro */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Campo de e-mail */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

        {/* Campo de senha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>

        {/* Link para recuperação de senha */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        {/* Botão de login */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        {/* Link para registro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a5a5a5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
    marginRight: 5,
  },
  registerLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;
