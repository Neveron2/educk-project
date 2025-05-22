import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import AuthService from '../services/auth.service';

/**
 * Tela de Registro
 * Permite que o usuário crie uma nova conta na plataforma Educk
 * 
 * @returns {JSX.Element} Componente de tela de registro
 */
const RegisterScreen = ({ navigation }) => {
  // Estados para armazenar os dados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' ou 'teacher'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Função para validar o formulário antes de enviar
   * @returns {boolean} Verdadeiro se o formulário for válido
   */
  const validateForm = () => {
    // Limpar erro anterior
    setError('');

    // Validar nome
    if (!name.trim()) {
      setError('Por favor, informe seu nome completo');
      return false;
    }

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
      setError('Por favor, informe uma senha');
      return false;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  /**
   * Função para lidar com o envio do formulário de registro
   */
  const handleRegister = async () => {
    // Validar formulário
    if (!validateForm()) {
      return;
    }

    try {
      // Iniciar carregamento
      setIsLoading(true);

      // Chamar serviço de autenticação
      const result = await AuthService.register(name, email, password, role);

      // Verificar resultado
      if (result.success) {
        // Limpar formulário
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');

        // Exibir mensagem de sucesso
        Alert.alert(
          'Cadastro realizado',
          'Seu cadastro foi realizado com sucesso! Verifique seu e-mail para ativar sua conta.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        // Exibir mensagem de erro
        setError(result.error?.message || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
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
      <Text style={styles.title}>Crie sua conta</Text>
      <Text style={styles.subtitle}>Junte-se à plataforma Educk</Text>

      {/* Formulário */}
      <View style={styles.form}>
        {/* Mensagem de erro */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Campo de nome */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

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

        {/* Campo de confirmação de senha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirme sua senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />
        </View>

        {/* Seleção de tipo de usuário */}
        <View style={styles.roleContainer}>
          <Text style={styles.label}>Você é:</Text>
          <View style={styles.roleOptions}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'student' && styles.roleOptionSelected
              ]}
              onPress={() => setRole('student')}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'student' && styles.roleOptionTextSelected
                ]}
              >
                Estudante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'teacher' && styles.roleOptionSelected
              ]}
              onPress={() => setRole('teacher')}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'teacher' && styles.roleOptionTextSelected
                ]}
              >
                Professor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão de registro */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>

        {/* Link para login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.loginLink}>Faça login</Text>
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
    width: 120,
    height: 120,
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
  roleContainer: {
    marginBottom: 20,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  roleOptionSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  roleOptionText: {
    color: '#333',
    fontSize: 16,
  },
  roleOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    marginRight: 5,
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default RegisterScreen;
